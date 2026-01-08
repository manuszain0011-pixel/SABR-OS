
export default function Announcements() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-red-950 dark:text-white">Global Announcements</h1>
                    <p className="text-muted-foreground mt-2">Broadcast messages to all users.</p>
                </div>
            </div>
            <div className="bg-muted/20 p-20 text-center rounded-xl border border-muted">
                Announcement Manager Coming Soon
            </div>
        </div>
    );
}
