import {
    BookOpen,
    Camera,
    Car,
    ChefHat,
    Hammer,
    Heart,
    HeartPulse,
    HelpCircle,
    Laptop,
    Leaf,
    Megaphone,
    Monitor,
    Package,
    Paintbrush,
    PenLine,
    Scale,
    Scissors,
    ScissorsSquare,
    Sparkles,
    TreePine,
    Truck,
    Utensils,
    Wrench,
    Zap,
    type LucideIcon,
} from "lucide-react";

type CategoryIconProps = {
    iconSlug: string;
    className?: string;
    strokeWidth?: number;
};

const iconMap: Record<string, LucideIcon> = {
    Wrench,
    Zap,
    Hammer,
    Paintbrush,
    Laptop,
    Monitor,
    Scissors,
    ChefHat,
    Utensils,
    Car,
    Sparkles,
    BookOpen,
    Package,
    Truck,
    TreePine,
    Leaf,
    Camera,
    Scale,
    ScissorsSquare,
    HeartPulse,
    Heart,
    Megaphone,
    PenLine,
};

function normalizeIconSlug(iconSlug: string) {
    const trimmed = iconSlug.trim();
    if (!trimmed) {
        return "";
    }

    if (iconMap[trimmed]) {
        return trimmed;
    }

    const normalized = trimmed
        .replace(/[-_\s]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
        .join("");

    if (iconMap[normalized]) {
        return normalized;
    }

    const lowered = trimmed.toLowerCase();

    if (lowered === "bolt") {
        return "Zap";
    }
    if (lowered === "box") {
        return "Package";
    }
    if (lowered === "sprout") {
        return "TreePine";
    }
    if (lowered === "palette") {
        return "Paintbrush";
    }
    if (lowered === "heart") {
        return "HeartPulse";
    }
    if (lowered === "water_drop") {
        return "Wrench";
    }
    if (lowered === "electric_bolt") {
        return "Zap";
    }
    if (lowered === "architecture") {
        return "Hammer";
    }
    if (lowered === "computer") {
        return "Laptop";
    }
    if (lowered === "checkroom") {
        return "ScissorsSquare";
    }
    if (lowered === "face_retouching_natural") {
        return "Scissors";
    }
    if (lowered === "restaurant") {
        return "ChefHat";
    }
    if (lowered === "car_repair") {
        return "Car";
    }
    if (lowered === "cleaning_services") {
        return "Sparkles";
    }
    if (lowered === "school") {
        return "BookOpen";
    }
    if (lowered === "local_shipping") {
        return "Package";
    }
    if (lowered === "eco") {
        return "TreePine";
    }
    if (lowered === "videocam") {
        return "Camera";
    }
    if (lowered === "gavel") {
        return "Scale";
    }
    if (lowered === "spa") {
        return "HeartPulse";
    }

    return normalized;
}

export function CategoryIcon({
    iconSlug,
    className = "h-8 w-8 text-blue-600",
    strokeWidth = 1.7,
}: CategoryIconProps) {
    const key = normalizeIconSlug(iconSlug);
    const IconComponent = iconMap[key] ?? HelpCircle;

    return <IconComponent className={className} strokeWidth={strokeWidth} />;
}
