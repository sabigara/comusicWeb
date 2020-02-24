import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { TrackParam, PlaybackStatus, Track } from '../common/Domain';
import { RootState } from '../reducers';
import { ActionTypeName as ATN, createAction } from '../actions';
import {
  addTrackSuccess,
  delTrackSuccess,
  updateTrackParam,
  changeActiveTake,
  loadActiveTakeRequest,
  loadActiveTakeSuccess,
  loadActiveTakeFailure,
} from '../actions/tracks';
import useAudioAPI from './useAudioAPI';
import useBackendAPI from './useBackendAPI';
import useShouldTrackPlay from './useShouldTrackPlay';
import { useLoading } from './loading';

export const useAddTrack = (verId: string) => {
  const backendAPI = useBackendAPI();
  const audioAPI = useAudioAPI();
  const dispatch = useDispatch();

  return useCallback(async () => {
    dispatch(createAction(ATN.Track.ADD_TRACK_REQUEST, verId));
    let resp: Track | null = null;
    try {
      resp = await backendAPI.addTrack(verId);
      dispatch(addTrackSuccess(verId, resp));
    } catch (err) {
      dispatch(
        createAction(ATN.Track.ADD_TRACK_FAILURE, verId, err.toString()),
      );
      return;
    }
    if (resp === null) {
      throw 'side effects for addTrack failed';
    }
    const trackAPI = audioAPI.loadTrack(resp.id);
    trackAPI.setVolume(resp.volume);
    trackAPI.setPan(resp.pan);
  }, [verId]);
};

export const useDelTrack = () => {
  const backendAPI = useBackendAPI();
  const audioAPI = useAudioAPI();
  const dispatch = useDispatch();
  const takes = useSelector((state: RootState) =>
    state.takes.allIds.map((id) => state.takes.byId[id]),
  );

  return useCallback(
    async (trackId: string) => {
      dispatch(createAction(ATN.Track.DEL_TRACK_REQUEST, trackId));
      try {
        await backendAPI.delTrack(trackId);
        const relatedTakeIds =
          takes
            .filter((take) => take.trackId === trackId)
            .map((take) => take.id) || [];
        dispatch(delTrackSuccess(trackId, relatedTakeIds));
      } catch (err) {
        err = err.toString();
        dispatch(createAction(ATN.Track.DEL_TRACK_FAILURE, trackId, err));
        return;
      }
      audioAPI.getTrack(trackId)?.release();
    },
    [takes],
  );
};

export const useUpdateTrackParam = () => {
  const audioAPI = useAudioAPI();
  const dispatch = useDispatch();

  return useCallback(
    async (trackId: string, param: TrackParam, value: number) => {
      dispatch(updateTrackParam(trackId, param, value));
      const track = audioAPI.getTrack(trackId);
      switch (param) {
        case TrackParam.volume:
          track?.setVolume(value);
          break;
        case TrackParam.pan:
          track?.setPan(value);
          break;
        default:
          break;
      }
    },
    [],
  );
};

export const useSwitchMuteSolo = (trackId: string) => {
  const dispatch = useDispatch();
  const track = useSelector((state: RootState) => state.tracks.byId[trackId]);
  const shouldPlay = useShouldTrackPlay(trackId);

  const switchMute = useCallback(() => {
    dispatch(
      updateTrackParam(trackId, TrackParam.isMuted, Number(!track.isMuted)),
    );
  }, [trackId, track, shouldPlay]);

  const switchSolo = useCallback(() => {
    dispatch(
      updateTrackParam(trackId, TrackParam.isSoloed, Number(!track.isSoloed)),
    );
  }, [trackId, track, shouldPlay]);

  return [switchMute, switchSolo];
};

export const useRestartTrack = (trackId: string) => {
  const playback = useSelector(
    (state: RootState) => state.playback,
    (prev, current) => prev.status === current.status,
  );
  const audioAPI = useAudioAPI();
  const loadingTake = useLoading('LOAD_ACTIVE_TAKE');
  useEffect(() => {
    if (loadingTake) return;
    const trackAPI = audioAPI.tracks[trackId];
    if (!trackAPI) return;
    trackAPI.stop();
    if (playback.status === PlaybackStatus.Playing) {
      if (!trackAPI.isPlaying) {
        trackAPI.play(playback.time);
      }
    }
  }, [audioAPI.tracks, loadingTake, playback.status, playback.time, trackId]);
};

export const useLoadActiveTake = () => {
  const dispatch = useDispatch();
  const audioAPI = useAudioAPI();
  const trackById = useSelector((state: RootState) => state.tracks.byId);
  const fileById = useSelector((state: RootState) => state.files.byId);
  const takeById = useSelector((state: RootState) => state.takes.byId);

  return async (trackId: string) => {
    dispatch(loadActiveTakeRequest(trackId));
    try {
      const track = trackById[trackId];
      const take = takeById[track.activeTake];
      const file = fileById[take.fileId];
      const trackAPI = audioAPI.getTrack(trackId);
      if (!trackAPI) throw 'No track to add take';
      trackAPI.stop();
      trackAPI.clearBuffer();
      await trackAPI.loadFile(file.url);
      dispatch(loadActiveTakeSuccess(trackId));
    } catch (err) {
      dispatch(loadActiveTakeFailure(trackId, err.toString()));
    }
  };
};

export const useChangeActiveTake = (trackId: string) => {
  const dispatch = useDispatch();
  const loadActiveTake = useLoadActiveTake();

  return useCallback(
    async (takeId) => {
      dispatch(changeActiveTake(trackId, takeId));
      loadActiveTake(trackId);
    },
    [loadActiveTake],
  );
};
