import {
  TypeMessage,
  TypeGuild,
  TypeTextChannel,
  ChannelMap,
  MemberMap,
  TypeMessageReaction,
  GuildMap,
  TypeMessageUpdateData,
  TypeGuildMember,
} from "./types/discord-bot-admin-types";
import moment from "moment";
import { DiscordUIState } from "./types/discord-bot-admin-react-types";

/**
 * Function for preparing data pre-render.
 * @param state state of App.
 */
export const handleAppRender = (state: DiscordUIState) => {
  let { guildList, guildName, channelName } = state;
  let guildID: string,
    channelID: string,
    members: MemberMap,
    channels: ChannelMap,
    messages: Array<TypeMessage>;
  console.log(guildList);
  if (Object.values(guildList).length > 0) {
    channels = (guildList[guildName] as TypeGuild).channels;
    messages = (channels[channelName] as TypeTextChannel).messages;
    if (messages.length > 35) {
      let start = messages.length - 35;
      let newMessages: Array<TypeMessage> = [];
      for (start; start < messages.length; start++) {
        newMessages.push(messages[start]);
      }
      messages = newMessages;
    }
    members = guildList[guildName].users;
    guildID = guildList[guildName].id;
    channelID = guildList[guildName].channels[channelName].id;
  }
  return { guildID, channelID, messages, channels, members };
};

/**
 * Parses individual messages recieved from socket event 'message'.
 * @param message
 * @param state
 */
export function onMessageParseMessage(message: string, state: DiscordUIState) {
  const msg: TypeMessage = JSON.parse(message) as TypeMessage;
  console.log(msg);
  let { guildList, messageNotifications, channelName } = state;
  const tempGuild = guildList[msg.guild] as TypeGuild;
  const channels = tempGuild.channels as ChannelMap;
  let channel = channels[msg.channel] as TypeTextChannel;
  channel.messages.push(msg);
  if (channel.name !== channelName) {
    messageNotifications[msg.guild + channel.name] += 1;
  }
  channel.messages = channel.messages.sort((a, b) => {
    return moment(a.createdAt).unix() - moment(a.createdAt).unix();
  });
  return { guildList: guildList };
}

/**
 * Handles batch message processing after socket response event from 'requestMessages'.
 * @param data
 * @param state
 */
export const handleBatchMessage = (data: string, state: DiscordUIState) => {
  const msgs: TypeMessage[] = JSON.parse(data) as Array<TypeMessage>;

  let { guildList, messageNotifications, channelName } = state;
  if (msgs.length === 0) {
    return guildList;
  }
  const tempGuild = guildList[msgs[0].guild] as TypeGuild;
  const channels = tempGuild.channels as ChannelMap;
  let channel = channels[msgs[0].channel] as TypeTextChannel;
  for (let msg of msgs) {
    channel.messages.push(msg);
    if (channel.name !== channelName) {
      messageNotifications[msg.guild + channel.name] += 1;
    }
  }
  channel.messages = channel.messages.sort((a, b) => {
    return moment(a.createdAt).unix() - moment(a.createdAt).unix();
  });
  return guildList;
};

/**
 * Creates new map of channels and deletes channel with id {@param id}
 * @param channels Optional channel to add.
 * @param id ID of channel to remove.
 * @param channel Original ChannelMap.
 */
export function createNewChannelsMap(
  channels: ChannelMap,
  id: string,
  channel?: TypeTextChannel
) {
  let channelArray = Object.values(channels);
  let newChannelMap: ChannelMap = new Map<string, TypeTextChannel>();
  channelArray.forEach((channel: TypeTextChannel) => {
    if (channel.id !== id) {
      newChannelMap[channel.name] = channel;
    }
  });
  if (channel) {
    newChannelMap[channel.name] = channel;
  }
  return newChannelMap;
}

/**
 * Set up guild message notification map & set guildName & channelName for display.
 * @param guildList
 * @param focusKey
 */
export function setUpDiscordFocus(
  guildList: Map<string, TypeGuild>,
  focusKey: string
) {
  let guildArray = Object.values(guildList);

  let channelName = "";
  let guildName = "";
  guildArray.forEach((guild: TypeGuild) => {
    let channelArray: TypeTextChannel[] = Object.values(guild.channels);
    channelArray.forEach((channel) => {
      let channelKey = guild.name + channel.name;

      if (channelKey === focusKey) {
        channelName = channel.name;
        guildName = guild.name;
      }
    });
  });

  return {
    channelName: channelName,
    guildName: guildName,
  };
}

export function onMessageDeleted(data: string, state: DiscordUIState) {
  let { guildList } = state,
    message = JSON.parse(data) as TypeMessage,
    { guild, channel, id } = message;
  let messageList = guildList[guild].channels[channel].messages as Array<
    TypeMessage
  >;
  let newMsgList = messageList.map((msg) => {
    if (msg.id === id) {
      return message;
    } else {
      return msg;
    }
  });
  guildList[guild].channels[channel].messages = newMsgList;
  return guildList;
}

export function messageReactionAdd(
  reactionstr: string,
  state: DiscordUIState
): GuildMap | boolean {
  let reaction: TypeMessageReaction = JSON.parse(reactionstr);
  console.log(JSON.stringify(reaction, null, 2) + " added.");
  let { guildList } = state;
  let { guildName, channelName, messageID } = reaction;
  if (guildName && guildName !== "") {
    let guild: TypeGuild = guildList[guildName];
    let channel: TypeTextChannel = guild.channels[channelName];
    let messages = channel.messages;
    let targetMessage: TypeMessage;
    let targetIdx: number;
    messages.forEach((message, idx) => {
      if (message.id === messageID) {
        targetMessage = message;
        targetIdx = idx;
      }
    });
    if (targetMessage.reactions) {
      let reactions = targetMessage.reactions;
      let newReactions = new Array<TypeMessageReaction>();
      reactions.forEach((react) => {
        if (react.emoji.id === reaction.emoji.id) {
          newReactions.push(reaction);
        } else {
          newReactions.push(react);
        }
      });
      if (newReactions.length === 0) {
        newReactions.push(reaction);
      }
      guildList[guildName].channels[channelName].messages[
        targetIdx
      ].reactions = newReactions;
      return guildList;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export function messageReactionRemove(
  reactionstr: string,
  state: DiscordUIState
): GuildMap | boolean {
  let reaction: TypeMessageReaction = JSON.parse(reactionstr);
  console.log(JSON.stringify(reaction, null, 2) + " removed.");
  let { guildName, channelName, messageID } = reaction;
  let { guildList } = state;
  if (guildName && guildName !== "") {
    let guild: TypeGuild = guildList[guildName];
    let channel: TypeTextChannel = guild.channels[channelName];
    let messages = channel.messages;
    let targetMessage: TypeMessage;
    let targetIdx: number;
    messages.forEach((message, idx) => {
      if (message.id === messageID) {
        targetMessage = message;
        targetIdx = idx;
      }
    });
    let { reactions } = targetMessage;
    let newReactions = new Array<TypeMessageReaction>();
    if (reactions && reactions.length > 0) {
      reactions.forEach((react) => {
        if (react.emoji.id === reaction.emoji.id) {
          if (react.count > 1) {
            newReactions.push(reaction);
          }
        } else {
          newReactions.push(react);
        }
      });
      guildList[guildName].channels[channelName].messages[
        targetIdx
      ].reactions = newReactions;
      return guildList;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export function messageUpdate(msg: string, state: DiscordUIState) {
  console.log(`got message update data`);
  const msgUpdateData: TypeMessageUpdateData = JSON.parse(msg);
  let { id, guild, channel } = msgUpdateData.old,
    { guildList } = state;
  let messageArray = guildList[guild].channels[channel].messages;
  let newMessageArray = messageArray.map(
    (message: TypeMessage, idx: number) => {
      if (message.id === id) {
        return msgUpdateData.new;
      } else {
        return message;
      }
    }
  );
  guildList[guild].channels[channel].messages = newMessageArray;
  return guildList;
}

export function presenceUpdate(pres: string, state: DiscordUIState) {
  const memberUpdated = JSON.parse(pres) as TypeGuildMember;
  let { guildList } = state,
    { guildName, displayName, id } = memberUpdated;
  let userList = (guildList[guildName] as TypeGuild).users;
  let newMemberList = new Map<string, TypeGuildMember>();
  Object.values(userList).forEach((user: TypeGuildMember) => {
    if (user.id !== id) {
      newMemberList[user.displayName] = user;
    }
  });
  newMemberList[displayName] = memberUpdated;
  guildList[guildName].users = newMemberList;
  return guildList;
}
