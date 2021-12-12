import React from 'react';

/**
 * @param {ArrayBuffer} data
 * @returns {Promise<{ max: number, peaks: number[] }}
 */
async function calculate(data) {
  const audioCtx = new AudioContext();

  // 音声をデコードする
  /** @type {AudioBuffer} */
  const buffer = await new Promise((resolve, reject) => {
    audioCtx.decodeAudioData(data.slice(0), resolve, reject);
  });
  // 左の音声データの絶対値を取る
  const leftData = buffer.getChannelData(0).map((data) => Math.abs(data));
  // 右の音声データの絶対値を取る
  const rightData = buffer.getChannelData(1).map((data) => Math.abs(data));
  // 左右の音声データの平均を取る
  const normalized = leftData.map((_, i) => (leftData[i] + rightData[i]) / 2);
  // 100 個の chunk に分ける
  const chunks = [];
  const size = Math.ceil(normalized.length / 100);
  for (let i = 0; i < normalized.length; i += size) {
    chunks.push(normalized.slice(i, i + size));
  }
  // chunk ごとに平均を取る
  const peaks = [];
  for (let i = 0; i < chunks.length; i++) {
    let sum = 0;
    for (const j of chunks[i]) {
      sum += j;
    }
    peaks.push(sum / chunks[i].length);
  }
  // chunk の平均の中から最大値を取る
  const max = Math.max(...peaks);
  console.log(max);

  return { max, peaks };
}

/**
 * @typedef {object} Props
 * @property {ArrayBuffer} soundData
 */

/**
 * @type {React.VFC<Props>}
 */
const SoundWaveSVG = ({ soundData }) => {
  const uniqueIdRef = React.useRef(Math.random().toString(16));
  const [{ max, peaks }, setPeaks] = React.useState({ max: 0, peaks: [] });

  React.useEffect(() => {
    calculate(soundData).then(({ max, peaks }) => {
      setPeaks({ max, peaks });
    });
  }, [soundData]);

  return (
    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 1">
      {peaks.map((peak, idx) => {
        const ratio = peak / max;
        return (
          <rect key={`${uniqueIdRef.current}#${idx}`} fill="#2563EB" height={ratio} width="1" x={idx} y={1 - ratio} />
        );
      })}
    </svg>
  );
};

export { SoundWaveSVG };
