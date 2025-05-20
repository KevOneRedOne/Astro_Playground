import { createSignal } from "solid-js";

interface CardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  year: number;
  mileage: number;
  description: string;
}

export default function Card(props: CardProps) {
  const [isHovered, setIsHovered] = createSignal(false);

  return (
    <div
      class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div class="relative h-48 overflow-hidden">
        <img 
          src={props.image}
          alt={props.title}
          class="w-full h-full object-cover transition-transform duration-500"
          style={{ transform: isHovered() ? "scale(1.05)" : "scale(1)" }}
        />
        <div class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md">
          ${props.price.toLocaleString()}
        </div>
      </div>

      <div class="p-4">
        <h3 class="font-bold text-lg mb-1">{props.title}</h3>
        <div class="flex justify-between text-gray-600 text-sm mb-2">
          <span>{props.year}</span>
          <span>{props.mileage.toLocaleString()} miles</span>
        </div>
        <p class="text-gray-700 line-clamp-2 mb-3">{props.description}</p>
        <button class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}