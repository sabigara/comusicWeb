import { combineReducers } from 'redux';

import { InstIcon } from '../common/Enums';
import { ActionUnionType, ActionTypeName } from '../actions/tracks';

const initialState = {
  id: '',
  name: '',
  volume: 0,
  pan: 0,
  isMuted: false,
  isSoloed: false,
  icon: InstIcon.Drums,
  activeTake: '',
  song: '',
  versionId: '',
  player: '',
};

export type TrackState = typeof initialState;

function track(
  state: TrackState = initialState,
  action: ActionUnionType,
): TrackState {
  switch (action.type) {
    case ActionTypeName.CHANGE_VOLUME:
      return { ...state, volume: action.payload.volume };
    case ActionTypeName.CHANGE_PAN:
      return { ...state, pan: action.payload.pan };
    case ActionTypeName.CHANGE_NAME:
      return { ...state, name: action.payload.name };
    case ActionTypeName.CHANGE_ACTIVE_TAKE:
      return { ...state, activeTake: action.payload.activeTakeId };
    case ActionTypeName.MUTE_ON:
      return { ...state, isMuted: true };
    case ActionTypeName.MUTE_OFF:
      return { ...state, isMuted: false };
    case ActionTypeName.SOLO_ON:
      return { ...state, isSoloed: true };
    case ActionTypeName.SOLO_OFF:
      return { ...state, isSoloed: false };
    case ActionTypeName.UPLOAD_TAKE_FILE_SUCCESS:
      return { ...state, activeTake: action.payload.take.id };
    case ActionTypeName.DELETE_TAKE_SUCCESS:
      return { ...state, activeTake: '' };
    default:
      return state;
  }
}

export type TrackByIdState = {
  [id: string]: TrackState;
};

function filterByActiveTake(state: TrackByIdState, activeTakeId: string) {
  return Object.values(state).filter((tr) => tr.activeTake === activeTakeId);
}

function byId(
  state: TrackByIdState = {},
  action: ActionUnionType,
): TrackByIdState {
  switch (action.type) {
    case ActionTypeName.CHANGE_VOLUME:
    case ActionTypeName.CHANGE_PAN:
    case ActionTypeName.CHANGE_NAME:
    case ActionTypeName.CHANGE_ACTIVE_TAKE:
    case ActionTypeName.MUTE_ON:
    case ActionTypeName.MUTE_OFF:
    case ActionTypeName.SOLO_ON:
    case ActionTypeName.SOLO_OFF:
    case ActionTypeName.UPLOAD_TAKE_FILE_SUCCESS:
      return {
        ...state,
        [action.id]: track(state[action.id], action),
      };
    case ActionTypeName.DELETE_TAKE_SUCCESS:
      // Zeroize activeTake attribute of all tracks that have deleted activeTake ID.
      const tracks = filterByActiveTake(state, action.id).reduce((prev, tr) => {
        return {
          ...prev,
          [tr.id]: track(tr, action),
        };
      }, {});
      return {
        ...state,
        ...tracks,
      };
    case ActionTypeName.ADD_TRACK_SUCCESS:
      return {
        ...state,
        [action.payload.track.id]: action.payload.track,
      };
    case ActionTypeName.DELETE_TRACK_SUCCESS:
      // Extract rest of the state except given take ID.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.id]: _, ...rest } = state;
      return {
        ...rest,
      };
    case ActionTypeName.FETCH_VER_CONTENTS_SUCCESS:
      return {
        ...state,
        ...action.payload.tracks.byId,
      };
    default:
      return state;
  }
}

function allIds(state: string[] = [], action: ActionUnionType): string[] {
  switch (action.type) {
    case ActionTypeName.ADD_TRACK_SUCCESS:
      return state.concat(action.payload.track.id);
    case ActionTypeName.FETCH_VER_CONTENTS_SUCCESS:
      return state.concat(action.payload.tracks.allIds);
    case ActionTypeName.DELETE_TRACK_SUCCESS:
      return state.filter((id) => id !== action.id);
    default:
      return state;
  }
}

export type TrackCombinedState = {
  byId: TrackByIdState;
  allIds: string[];
};

export default combineReducers({
  byId,
  allIds,
});
