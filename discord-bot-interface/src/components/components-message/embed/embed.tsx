import React from 'react';
import Moment from 'moment';
import { parseAllowLinks, parseEmbedTitle } from '../markdown';
import { extractRGB } from '../color';
import '../../../css/disc.css'
import { parseForNewline } from '../regexfuncs';
import { TypeMessageEmbedField, TypeEmbed, TypeUser } from '../../../types/discord-bot-admin-types';

const Link = ({ children, ...props}) => {
  return <a target='_blank' rel='noreferrer' {...props}>{children}</a>;
};

const EmbedColorPill = ({ color }) => {
  let computed:string;

  if (color) {
    const c = extractRGB(color);
    computed = `rgba(${c.r},${c.g},${c.b},1)`;
  }

  const style = { backgroundColor: computed !== undefined ? computed : '' };
  return <div className='embed-color-pill' style={style} />;
}

const EmbedTitle = ({ title, url }) => {
  if (!title) {
    return null;
  }

  let computed = <div className='embed-title'>{parseEmbedTitle(parseForNewline(title))}</div>;
  if (url) {
    computed = <Link href={url} className='embed-title'>{parseEmbedTitle(parseForNewline(title))}</Link>;
  }

  return computed;
};

const EmbedDescription = ({ content }) => {
  if (!content) {
    return null;
  }

  return <div className='embed-description markup'>{parseAllowLinks(parseForNewline(content))}</div>;
};

const EmbedAuthor = ({ name, avatarURL, avatar }:TypeUser) => {
  if (!name) {
    return null;
  }

  let authorName:JSX.Element;
  if (name) {
    authorName = <span className='embed-author-name'>{name}</span>;
    if (avatarURL) {
      // eslint-disable-next-line
      authorName = <Link href={avatarURL} className='embed-author-name'>{name}</Link>;
    }
  }

  const authorIcon = avatarURL ? (<img src={avatarURL} alt='' className='embed-author-icon' />) : null;

  return <div className='embed-author'>{authorIcon}{authorName}</div>;
};

const EmbedField = ({ name, value, inline }) => {
  if (!name && !value) {
    return null;
  }

  const cls = 'embed-field' + (inline ? ' embed-field-inline' : '');

  const fieldName = name ? (<div className='embed-field-name'>{parseEmbedTitle(parseForNewline(name))}</div>) : null;
  const fieldValue = value ? (<div key={`${name}-${Math.floor(Math.random()*10000)}`} className='embed-field-value markup'>{parseAllowLinks(parseForNewline(value))}</div>) : null;

  return <div key={Math.floor(Math.random()*10000)} className={cls}>{fieldName}{fieldValue}</div>;
};

const EmbedThumbnail = ({ url }) => {
  if (!url) {
    return null;
  }

  return (
    <img
      src={url}
      alt={url}
      className='embed-rich-thumb'
      style={{ maxWidth: 100, maxHeight: 100 }}
    />
  );
};

const EmbedImage = ({ url }) => {
  if (!url) {
    return null;
  }

  // NOTE: for some reason it's a link in the original DOM
  // not sure if this breaks the styling, probably does
  //
  return <a className='embed-thumbnail embed-thumbnail-rich' 
            style={{maxHeight:"350px",maxWidth:"350px"}} 
            href={url}>
              <img className='image'
                   style={{maxHeight:"350px",maxWidth:"350px"}} 
                   src={url} 
                   alt={url}/>
         </a>;
};

const EmbedFooter = ({ timestamp, text, iconURL }) => {
  if (!text && !timestamp) {
    return null;
  }

  // pass null, since undefined will make moment(...) return the current date/time
  let calculatedTime:string;
  let time = Moment(timestamp !== undefined ? timestamp : null);
  calculatedTime = time.isValid() ? time.format('ddd MMM Do, YYYY [at] h:mm A') : null;

  const footerText = [text, calculatedTime].filter(Boolean).join(' | ');
  const footerIcon = text && iconURL ? (
    <img src={iconURL} className='embed-footer-icon' alt='' width='20' height='20' />
  ) : null;

  return <div>{footerIcon}<span className='embed-footer'>{footerText}</span></div>;
};

const EmbedFields = ({ fields }) => {
  if (!fields) {
    return null;
  }
  let _fields = fields as TypeMessageEmbedField[];
return <div className='embed-fields'>{_fields.map((field:TypeMessageEmbedField, idx) => <EmbedField key={idx} {...field} />)}</div>;
};

const Embed = ({
  color, author, title, url, description, fields, thumbnail, image, timestamp, footer
}:TypeEmbed) => {
  return (
    <div className='accessory'>
      <div className='embed-wrapper'>
        <EmbedColorPill color={color} />
        <div className='embed embed-rich'>
          <div className='embed-content'>
            <div className='embed-content-inner'>
              <EmbedAuthor {...author} />
              <EmbedTitle title={title} url={url} />
              <EmbedDescription content={description} />
              <EmbedFields fields={fields} />
            </div>
            <EmbedThumbnail {...thumbnail} />
          </div>
          <EmbedImage {...image} />
          <EmbedFooter timestamp={timestamp} {...footer} />
        </div>
      </div>
    </div>
  );
};


export default Embed;
