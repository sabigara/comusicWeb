import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { Song } from '../common/Domain';
import { ActionTypeName as ATN, createAction } from '../actions';
import { addSongSuccess } from '../actions/songs';
import useBackendAPI from './useBackendAPI';

export const useAddSong = () => {
  const backendAPI = useBackendAPI();
  const dispatch = useDispatch();

  return useCallback(async (studioId: string, name: string) => {
    const reqId = uuidv4();
    dispatch(createAction(ATN.Song.ADD_SONG_REQUEST, reqId));
    let resp: Song | null = null;
    try {
      resp = await backendAPI.addSong(studioId, name);
      dispatch(addSongSuccess(reqId, resp));
    } catch (err) {
      dispatch(createAction(ATN.Song.ADD_SONG_FAILURE, reqId, err.toString()));
      return;
    }
  }, []);
};
