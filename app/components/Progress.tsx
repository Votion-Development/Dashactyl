import ArcProgress from 'react-arc-progress';

interface ProgressProps {
  title: string;
  text: any;
  progress: number;
  color: string;
}

const sansFont =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

export default function Progress({
  title,
  text,
  progress,
  color,
}: ProgressProps) {
  return (
    <div className="mx-2 mt-2 block max-w-sm rounded-lg bg-indigo-900 p-6 shadow-lg">
      <h5 className="mb-2 text-center text-xl font-medium leading-tight text-white">
        {title}
      </h5>
      <ArcProgress
        fillColor={`rgb(${color})`}
        progress={progress}
        size={100}
        text={text.toString()}
        textStyle={{
          color: 'white',
          font: sansFont,
          size: '24',
        }}
      />
    </div>
  );
}
