import Card from "./card/card";

interface Car {
  id: string;
  documentId?: string;
  name: string;
  model: string;
  image?: {
    url: string;
    alt?: string;
  }[];
}

interface GridProps {
  cars: Car[];
  title?: string;
}

const Grid = ({ cars, title }: GridProps)=> {
  const getImageUrl = (image: { url: string; alt?: string }[] | undefined): string => {
    if (!image || image.length === 0) return '';
    return image[0].url || '';
  };

  const apiPrefix = 'http://localhost:1337';
  
  const getFullImageUrl = (image: { url: string; alt?: string }[] | undefined): string => {
    const url = getImageUrl(image);
    return url.startsWith('http') ? url : `${apiPrefix}${url}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {title && (
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cars.map((car) => (
          <Card
            key={car.id}
            id={car.id}
            documentId={car?.documentId || car.id}
            name={car.name || ''}
            model={car.model || ''}
            image={getFullImageUrl(car.image) ? [{ url: getFullImageUrl(car.image), alt: car.image?.[0]?.alt || '' }] : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default Grid;