interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

export function PropertyMap({ latitude, longitude, title }: PropertyMapProps) {
  const bbox = `${longitude - 0.02},${latitude - 0.02},${longitude + 0.02},${latitude + 0.02}`;

  return (
    <div className="overflow-hidden rounded-[20px] border border-surface-200/80">
      <iframe
        title={`Map location for ${title}`}
        className="h-72 w-full sm:h-96"
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude}%2C${longitude}`}
      />
    </div>
  );
}
