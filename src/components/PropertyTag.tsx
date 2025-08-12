import { 
  Armchair, Bath, BedDouble, BedSingle, Bed, Bike, Box, BriefcaseBusiness, Building2, Bus,
  BusFront, Car, CarFront, Cigarette, CigaretteOff, DoorClosed, DoorOpen, GraduationCap,
  Landmark, MapPin, Leaf, Maximize, Mountain, MountainSnow, Plane, School, Ruler, RadioTower,
  Scaling, ShoppingBasket, Sofa, Store, Truck, Tractor, TrainFront, University, Warehouse,
  Toilet, Sun, Hotel, House, Fuel, Gauge, RulerDimensionLine
} from 'lucide-react'

interface PropertyTag {
  id: string
  name: string
  icon?: string
}

interface PropertyTagProps {
  tag: PropertyTag
  className?: string
  showIcon?: boolean
}

// Map icon names to Lucide components
const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    'ArmChair': Armchair,
    'Bath': Bath,
    'BedDouble': BedDouble,
    'BedSingle': BedSingle,
    'Bed': Bed,
    'Bike': Bike,
    'Box': Box,
    'BriefcaseBusiness': BriefcaseBusiness,
    'Building2': Building2,
    'Bus': Bus,
    'BusFront': BusFront,
    'Car': Car,
    'CarFront': CarFront,
    'Cigarette': Cigarette,
    'CigaretteOff': CigaretteOff,
    'DoorClosed': DoorClosed,
    'DoorOpen': DoorOpen,
    'GraduationCap': GraduationCap,
    'Landmark': Landmark,
    'MapPin': MapPin,
    'Leaf': Leaf,
    'Maximize': Maximize,
    'Mountain': Mountain,
    'MountainSnow': MountainSnow,
    'Plane': Plane,
    'School': School,
    'Ruler': Ruler,
    'RadioTower': RadioTower,
    'Scaling': Scaling,
    'ShoppingBasket': ShoppingBasket,
    'Sofa': Sofa,
    'Store': Store,
    'Truck': Truck,
    'Tractor': Tractor,
    'TrainFront': TrainFront,
    'University': University,
    'Warehouse': Warehouse,
    'Toilet': Toilet,
    'Sun': Sun,
    'Hotel': Hotel,
    'House': House,
    'Fuel': Fuel,
    'Gauge': Gauge,
    'RulerDimensionLine': RulerDimensionLine
}

export default function PropertyTagComponent({ tag, className = "", showIcon = true }: PropertyTagProps) {
  const IconComponent = tag.icon ? iconMap[tag.icon] : null

  if (showIcon) {
    return (
      <span className={`inline-flex flex-col items-center gap-1 bg-primary-100 text-primary-700 px-3 py-2 rounded-md text-sm font-medium ${className}`}>
        {IconComponent && <IconComponent className="w-4 h-4" />}
        <span className="text-xs">{tag.name}</span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center bg-primary-100 text-primary-700 px-2 py-1 rounded-xs text-xs font-medium ${className}`}>
      {tag.name}
    </span>
  )
}
