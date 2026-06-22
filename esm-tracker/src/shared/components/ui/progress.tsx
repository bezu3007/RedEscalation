type Props = {
  value: number;
};

export function Progress({ value }: Props) {
  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-600 transition-all"
        style={{
          width: `${value}%`,
        }}
      />
    </div>
  );
}