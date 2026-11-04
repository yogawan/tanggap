// Shared between `Root.tsx` (the registered <Composition>) and the
// `/demo` page's <Player>, so the two never drift out of sync.

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const TRANSITION_DURATION = 15;

export const DASHBOARD_SCENE_DURATION = 135;
export const AGENT_SCENE_DURATION = 960;
export const TRACE_SCENE_DURATION = 150;
export const OUTRO_SCENE_DURATION = 90;

export const TOTAL_DURATION =
  DASHBOARD_SCENE_DURATION +
  AGENT_SCENE_DURATION +
  TRACE_SCENE_DURATION +
  OUTRO_SCENE_DURATION -
  3 * TRANSITION_DURATION;
