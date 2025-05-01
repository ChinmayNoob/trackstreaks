import { Poppins } from "next/font/google";
import { GiBandit } from "react-icons/gi";


import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

interface HeaderProps {
    label: string;
}

export const Header = ({ label }: HeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-y-4 items-center">
            <h1 className={cn(
                "text-3xl font-semibold flex gap-2 items-center",
                font.className,
            )}>
                <GiBandit />
                TrackStreaks
            </h1>
            <p className="text-muted-foreground text-sm">
                {label}
            </p>
        </div>
    )

}