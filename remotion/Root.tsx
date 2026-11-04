import { Composition, Folder } from "remotion";
import "./globals.css";
import { FPS, HEIGHT, TOTAL_DURATION, WIDTH } from "./constants";
import { DemoVideo } from "./DemoVideo";
import {
  FPS as PITCH_FPS,
  HEIGHT as PITCH_HEIGHT,
  WIDTH as PITCH_WIDTH,
} from "./pitch/constants";
import {
  calculatePitchMetadata,
  placeholderSceneDurations,
} from "./pitch/metadata";
import { PitchVideo } from "./pitch/PitchVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TRACIA-Demo"
        component={DemoVideo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Folder name="Pitch">
        <Composition
          id="TRACIA-Pitch"
          component={PitchVideo}
          fps={PITCH_FPS}
          width={PITCH_WIDTH}
          height={PITCH_HEIGHT}
          durationInFrames={1} // placeholder; calculateMetadata always overrides this
          defaultProps={{ sceneDurations: placeholderSceneDurations }}
          calculateMetadata={calculatePitchMetadata}
        />
      </Folder>
    </>
  );
};
