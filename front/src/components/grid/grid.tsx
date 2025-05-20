import Card from "./card/card";

interface Car {
  id: string;
  title: string;
  image: string;
  price: number;
  year: number;
  mileage: number;
  description: string;
}

interface GridProps {
  cars: Car[];
  title?: string;
}

export default function Grid(props: GridProps) {
  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
      {props.title && (
        <h2 class="text-2xl font-bold mb-6 text-center">{props.title}</h2>
      )}
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {props.cars.map((car) => (
          <Card
            key={car.id}
            id={car.id}
            title={car.title}
            image={car.image}
            price={car.price}
            year={car.year}
            mileage={car.mileage}
            description={car.description}
          />
        ))}
      </div>
    </div>
  );
}
