// A captioned walkthrough recorded by `yarn capture` (MP4 + WebVTT in static/video/).
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Video({ id, title }: { id: string; title: string }) {
  const base = useBaseUrl(`/video/${id}`);
  return (
    <figure className="nh-video">
      <video controls preload="metadata" poster={`${base}.jpg`} aria-label={title}>
        <source src={`${base}.mp4`} type="video/mp4" />
        <track kind="captions" src={`${base}.vtt`} srcLang="en" label="English" default />
      </video>
      <figcaption className="nh-shot__caption">{title}</figcaption>
    </figure>
  );
}
