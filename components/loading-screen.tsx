import { Loader2, Image as ImageIcon, Text, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-6 px-4 bg-background text-foreground">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold">Loading your content...</h1>
                <p className="text-muted-foreground text-sm">
                    Please wait while we get everything ready.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 w-full max-w-4xl">
                <SkeletonCard icon={<ImageIcon className="text-blue-500" />} />
                <SkeletonCard icon={<Users className="text-green-500" />} />
                <SkeletonCard icon={<Text className="text-purple-500" />} />
            </div>
        </div>
    );
}

function SkeletonCard({ icon }: { icon: React.ReactNode }) {
    return (
        <div className="p-4 border rounded-xl shadow-sm bg-card">
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-muted">
                    {icon}
                </div>
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-32 mt-4 w-full rounded-lg" />
        </div>
    );
}
