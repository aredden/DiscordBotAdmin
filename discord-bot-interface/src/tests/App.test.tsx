import React from 'react';
import { render } from '@testing-library/react';
import DiscordUI from '../DiscordUI';

test('renders learn react link', () => {
  const { getByText } = render(<DiscordUI />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
