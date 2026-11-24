import Icon from "./Icon";

export default function StartStopButton({ camera, startLabel, stopLabel }) {
  return camera.on ? (
    <button className="btn btn-danger" onClick={camera.stop}>
      <Icon name="stop" size={15} />
      {stopLabel}
    </button>
  ) : (
    <button className="btn btn-primary" onClick={camera.start}>
      <Icon name="camera" size={16} />
      {startLabel}
    </button>
  );
}
