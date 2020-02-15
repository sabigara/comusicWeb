import React from 'react';
import { useDispatch } from 'react-redux';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import styled from 'styled-components';

import Color from '../common/Color';
import { deleteTrack } from '../actions/tracks';

type Props = {
  trackId: string;
};

type Data = {
  id: string;
  method: string;
};

const TrackContextMenu: React.FC<Props> = ({ trackId, children }) => {
  const dispatch = useDispatch();

  const handler = (e: any, data: Data) => {
    e.stopPropagation();
    switch (data.method) {
      case 'DELETE':
        dispatch(deleteTrack(data.id));
        break;
    }
  };
  return (
    <div>
      <ContextMenu id={`track-ctx-${trackId}`}>
        <MenuItem data={{ method: 'DELETE', id: trackId }} onClick={handler}>
          Delete
        </MenuItem>
      </ContextMenu>
      <ContextMenuTrigger id={`track-ctx-${trackId}`}>
        <Wrapper>{children}</Wrapper>
      </ContextMenuTrigger>
    </div>
  );
};

const Wrapper = styled.div`
  display: flex;
  width: 360px;
  background-color: ${Color.Track.Background};
`;

export default TrackContextMenu;
