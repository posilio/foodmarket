// Reusable badge component for dietary labels and allergen tags.
interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "amber" | "gray";
}

export function Badge({ children, variant = "gray" }: BadgeProps) {
  const styles = {
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`text-xs border px-2 py-1 rounded-full font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
