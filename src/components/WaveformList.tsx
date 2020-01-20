import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { PlaybackStatus } from '../common/Enums';
import { updateTime } from '../actions/playback';
import useAudioAPI from '../hooks/useAudioAPI';
import { pixelsToSeconds } from '../common/conversions';
import styled from 'styled-components';
import Color from '../common/Color';
import Waveform from './Waveform';
import Locator from './Locator';
import Cursor from './Cursor';

const hasStateChanged = (prev: any[], current: any[]) => {
  return prev.reduce(
    (isEqual: boolean, track: any, i: number) => {
      return isEqual || track.id === current[i].id 
    }, false
  );
}

const PADDING_LEFT = 20;

const WaveformList: React.FC = () => {
  const state = useSelector((state: any) => {
    return state.tracks.allIds.map(id => state.tracks.byId[id]);
  }, (prev, current) => {
    // Rerendering should happen only when track(s) is inserted or deleted,
    if (prev.length !== current.length) { 
      return false 
    } else {
      return hasStateChanged(prev, current);
    }
  });
  const playbackStatus = useSelector(
    (state: any) => state.playback.status
  );

  const dispatch = useDispatch();
  const audioAPI = useAudioAPI();
  const ref = useRef<HTMLDivElement>(null);

  const onSomewhereClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let left = e.clientX - ref.current!.getBoundingClientRect().left;
    if (left < 0) { 
      left = 0;
    }
    const time = pixelsToSeconds(left, audioAPI.resolution, audioAPI.sampleRate);
    dispatch(updateTime(time));
    if (playbackStatus === PlaybackStatus.Playing) {
      audioAPI.stop();
      audioAPI.play(time);
    }
  }

  return (
    <Wrapper onClick={onSomewhereClick}>
      <Locator/>
      <Cursor offset={PADDING_LEFT}/>
      <div 
        id="waveform-parent"
        ref={ref}
      >
        {
          state.map((track, i) => {
            return (
              <WaveformWrapper key={`waveform-${i}`}>
                <Waveform trackId={track.id}/>
              </WaveformWrapper>
            )
          })
        }
      </div>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  flex-grow: 1;
  background-color: ${Color.Waveform.Background};
  overflow-x: auto;
  overflow-y: visible;
  padding-left: ${PADDING_LEFT.toString() + 'px'};
  &::-webkit-scrollbar {
    background-color: ${Color.Waveform.Background};
    height: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
    height: 4px;
  }
`

const WaveformWrapper = styled.div`
  height: 170px;
`

export default WaveformList;
