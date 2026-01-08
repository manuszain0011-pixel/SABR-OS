import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Area, AreaType, UserProfile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Activity,
  BadgeCheck,
  Briefcase,
  Leaf,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";

const AREA_TYPES: { value: AreaType; label: string; icon: typeof Activity }[] = [
  { value: "personal", label: "Personal", icon: Sparkles },
  { value: "professional", label: "Professional", icon: Briefcase },
  { value: "financial", label: "Financial", icon: Wallet },
  { value: "spiritual", label: "Spiritual", icon: Leaf },
  { value: "health", label: "Health", icon: Activity },
  { value: "relationships", label: "Relationships", icon: BadgeCheck },
  { value: "learning", label: "Learning", icon: Sparkles },
  { value: "creative", label: "Creative", icon: Sparkles },
];

function setMeta(name: string, content: string) {
  const el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (el) el.content = content;
}

export default function Profile() {
  const {
    profile,
    updateProfile,
    settings,
    updateSettings,
    areas = [],
    createArea,
    updateArea,
    deleteArea: removeArea,
    goals = [],
    projects = [],
    tasks = [],
    habits = [],
    stats = { spiPointsToday: 0 },
  } = useApp();


  const [profileDraft, setProfileDraft] = useState<any>({});
  const [settingsDraft, setSettingsDraft] = useState<any>({});

  const [areaDraft, setAreaDraft] = useState<any>({
    name: "",
    description: "",
    type: "personal",
  });
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);

  useEffect(() => {
    if (profile) setProfileDraft(profile);
  }, [profile]);

  useEffect(() => {
    if (settings) setSettingsDraft(settings);
  }, [settings]);

  const areaStats = useMemo(() => {
    const byArea = new Map<
      string,
      {
        goalsTotal: number;
        goalsCompleted: number;
        projectsTotal: number;
        projectsCompleted: number;
        tasksTotal: number;
        tasksCompleted: number;
        habitsTotal: number;
        habitsActive: number;
      }
    >();

    const ensure = (areaId: string) => {
      if (!byArea.has(areaId)) {
        byArea.set(areaId, {
          goalsTotal: 0,
          goalsCompleted: 0,
          projectsTotal: 0,
          projectsCompleted: 0,
          tasksTotal: 0,
          tasksCompleted: 0,
          habitsTotal: 0,
          habitsActive: 0,
        });
      }
      return byArea.get(areaId)!;
    };

    (goals as any[]).forEach((g) => {
      if (!g.area_id) return;
      const s = ensure(g.area_id);
      s.goalsTotal += 1;
      if (g.status === "completed") s.goalsCompleted += 1;
    });

    projects.forEach((p) => {
      if (!p.area_id) return;
      const s = ensure(p.area_id);
      s.projectsTotal += 1;
      if (p.status === "completed") s.projectsCompleted += 1;
    });

    tasks.forEach((t) => {
      if (!t.area_id) return;
      const s = ensure(t.area_id);
      s.tasksTotal += 1;
      if (t.status === "completed") s.tasksCompleted += 1;
    });

    habits.forEach((h) => {
      if (!h.area_id) return;
      const s = ensure(h.area_id);
      s.habitsTotal += 1;
      if (h.is_active) s.habitsActive += 1;
    });

    return byArea;
  }, [goals, projects, tasks, habits]);

  const overall = useMemo(() => {
    const totals = {
      goals: (goals as any[]).filter((g) => g.status !== 'archived').length,
      projects: (projects as any[]).filter((p) => p.status !== 'archived').length,
      tasks: (tasks as any[]).filter((t) => t.status !== 'archived').length,
      habits: (habits as any[]).filter((h) => h.is_active).length,
    };

    const done = {
      goals: goals.filter((g) => g.status === "completed").length,
      projects: projects.filter((p) => p.status === "completed").length,
      tasks: tasks.filter((t) => t.status === "completed").length,
    };

    const completion = (doneCount: number, totalCount: number) =>
      totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

    const productivityScore = Math.round(
      (completion(done.tasks, totals.tasks) * 0.45 +
        completion(done.projects, totals.projects) * 0.35 +
        completion(done.goals, totals.goals) * 0.2) /
      1
    );

    return {
      totals,
      done,
      productivityScore,
    };
  }, [goals, projects, tasks, habits]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile) await updateProfile(profileDraft);
    if (settings) await updateSettings(settingsDraft);
    toast.success("Profile updated");
  };

  const handleAddArea = async () => {
    if (!areaDraft.name.trim()) return;
    await createArea({
      name: areaDraft.name.trim(),
      description: areaDraft.description.trim(),
      type: areaDraft.type as any,
      is_active: true,
    });
    setAreaDraft({ name: "", description: "", type: "personal" });
    setAreaDialogOpen(false);
    toast.success("Area added");
  };

  const toggleAreaActive = async (areaId: string, active: boolean) => {
    await updateArea({ id: areaId, is_active: active });
  };

  const updateAreaField = async (areaId: string, patch: any) => {
    await updateArea({ id: areaId, ...patch });
  };

  return (
    <main className="space-y-6 animate-fade-in app-3d-root">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile & Areas</h1>
          <p className="text-muted-foreground">
            Your life dashboard settings + domain progress (Deen & Dunya).
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="bento-card py-3 px-4 text-center">
            <p className="text-xs text-muted-foreground">SPI Today</p>
            <p className="text-xl font-bold text-primary">{stats.spiPointsToday}</p>
          </div>
          <div className="bento-card py-3 px-4 text-center">
            <p className="text-xs text-muted-foreground">Productivity</p>
            <p className="text-xl font-bold text-primary">{(overall as any).productivityScore || 0}%</p>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bento-card text-center">
          <p className="text-xs text-muted-foreground">Goals</p>
          <p className="text-2xl font-bold text-primary">
            {overall.done.goals}/{overall.totals.goals}
          </p>
        </div>
        <div className="bento-card text-center">
          <p className="text-xs text-muted-foreground">Projects</p>
          <p className="text-2xl font-bold text-primary">
            {overall.done.projects}/{overall.totals.projects}
          </p>
        </div>
        <div className="bento-card text-center">
          <p className="text-xs text-muted-foreground">Tasks</p>
          <p className="text-2xl font-bold text-primary">
            {overall.done.tasks}/{overall.totals.tasks}
          </p>
        </div>
        <div className="bento-card text-center !bg-[#0B5B42] text-white">
          <p className="text-xs opacity-80">Active Habits</p>
          <p className="text-2xl font-bold">{overall.totals.habits}</p>
        </div>
      </section>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="areas">Areas</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <section className="bento-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold">Personal Profile</h2>
                <p className="text-sm text-muted-foreground">Used across the whole system</p>
              </div>
              <Button onClick={handleSaveProfile}>Save</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profileDraft.name || ''}
                  onChange={(e) => setProfileDraft((p: any) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileDraft.email || ''}
                  onChange={(e) => setProfileDraft((p: any) => ({ ...p, email: e.target.value }))}
                  placeholder="optional"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileDraft.bio || ''}
                  onChange={(e) => setProfileDraft((p: any) => ({ ...p, bio: e.target.value }))}
                  placeholder="A short intention for your system…"
                />
              </div>
            </div>
          </section>

          <section className="bento-card">
            <div className="mb-4">
              <h2 className="font-semibold">System Defaults</h2>
              <p className="text-sm text-muted-foreground">These power prayer times, currency, and planning views</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prayer City</Label>
                <Input
                  value={settingsDraft.city || ''}
                  onChange={(e) =>
                    setSettingsDraft((p: any) => ({
                      ...p,
                      city: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Prayer Country</Label>
                <Input
                  value={settingsDraft.country || ''}
                  onChange={(e) =>
                    setSettingsDraft((p: any) => ({
                      ...p,
                      country: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={settingsDraft.default_currency || 'USD'}
                  onValueChange={(v) =>
                    setSettingsDraft((p: any) => ({
                      ...p,
                      default_currency: v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {[
                      "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "HKD", "NZD",
                      "SEK", "KRW", "SGD", "NOK", "MXN", "INR", "RUB", "ZAR", "TRY", "BRL",
                      "TWD", "DKK", "PLN", "THB", "IDR", "HUF", "CZK", "ILS", "CLP", "PHP",
                      "AED", "COP", "SAR", "MYR", "RON", "VND", "ARS", "IQD", "KWD", "NGN",
                      "UAH", "PKR", "EGP", "QAR", "BHD", "OMR", "JOD", "DZD", "MAD", "LBP",
                      "SYP", "SDG", "TND", "YER", "AFN", "ALL", "AMD", "ANG", "AOA", "AWG",
                      "AZN", "BAM", "BBD", "BDT", "BGN", "BIF", "BMD", "BND", "BOB", "BSD",
                      "BTN", "BWP", "BYN", "BZD", "CDF", "CRC", "CUP", "CVE", "DJF", "DOP",
                      "ERN", "ETB", "FJD", "FKP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ",
                      "GYD", "HNL", "HTG", "ISK", "JMD", "KES", "KGS", "KHR", "KMF",
                      "KPW", "KYD", "KZT", "LAK", "LKR", "LRD", "LSL", "LYD", "MDL", "MGA",
                      "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MZN", "NAD",
                      "NIO", "NPR", "PAB", "PEN", "PGK", "PYG", "RSD", "RWF", "SBD", "SCR",
                      "SLL", "SOS", "SRD", "SSP", "STN", "SVC", "SZL", "TJS", "TMT", "TOP",
                      "TTD", "TZS", "UGX", "UYU", "UZS", "VES", "VUV", "WST", "XAF", "XCD",
                      "XOF", "XPF", "ZMW", "ZWL"
                    ].sort().map((curr) => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Week starts on</Label>
                <Select
                  value={String(settingsDraft.week_starts_on || '1')}
                  onValueChange={(v) =>
                    setSettingsDraft((p: any) => ({
                      ...p,
                      week_starts_on: v, // Keep as string for Select, backend likely expects string or int but standardizing
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Week start" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          <section className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Life Areas</h2>
              <p className="text-sm text-muted-foreground">
                Link goals/projects/tasks to areas for a complete operating system.
              </p>
            </div>

            <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add Area
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Area</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={areaDraft.name}
                      onChange={(e) => setAreaDraft((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g., Deen, Career, Health"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={areaDraft.type}
                      onValueChange={(v) => setAreaDraft((p) => ({ ...p, type: v as AreaType }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Area type" />
                      </SelectTrigger>
                      <SelectContent>
                        {AREA_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={areaDraft.description}
                      onChange={(e) =>
                        setAreaDraft((p) => ({ ...p, description: e.target.value }))
                      }
                      placeholder="What does excellence look like in this area?"
                    />
                  </div>

                  <Button onClick={handleAddArea} disabled={!areaDraft.name.trim()}>
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </section>

          {areas.length === 0 ? (
            <div className="bento-card text-center py-12">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No areas yet. Create your first domain.</p>
            </div>
          ) : (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {areas.map((area) => {
                const s = areaStats.get(area.id) || {
                  goalsTotal: 0,
                  goalsCompleted: 0,
                  projectsTotal: 0,
                  projectsCompleted: 0,
                  tasksTotal: 0,
                  tasksCompleted: 0,
                  habitsTotal: 0,
                  habitsActive: 0,
                };

                const scoreDen = s.goalsTotal + s.projectsTotal + s.tasksTotal;
                const scoreNum = s.goalsCompleted + s.projectsCompleted + s.tasksCompleted;
                const progress = scoreDen > 0 ? Math.round((scoreNum / scoreDen) * 100) : 0;

                const typeInfo = AREA_TYPES.find((t) => t.value === area.type);
                const Icon = typeInfo?.icon || Activity;

                return (
                  <article key={area.id} className="bento-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Input
                              value={area.name}
                              onChange={(e) => updateAreaField(area.id, { name: e.target.value })}
                              className="h-9 max-w-[260px]"
                            />
                            <Badge variant="outline">{typeInfo?.label ?? area.type}</Badge>
                          </div>
                          <Textarea
                            value={area.description}
                            onChange={(e) => updateAreaField(area.id, { description: e.target.value })}
                            className="mt-2 min-h-20"
                            placeholder="Describe this area"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Active</span>
                        <Switch
                          checked={area.is_active || false}
                          onCheckedChange={(val) => toggleAreaActive(area.id, val)}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-lg bg-secondary/50 text-center">
                        <p className="text-lg font-bold text-primary">{s.goalsCompleted}/{s.goalsTotal}</p>
                        <p className="text-[10px] text-muted-foreground">Goals</p>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary/50 text-center">
                        <p className="text-lg font-bold text-primary">{s.projectsCompleted}/{s.projectsTotal}</p>
                        <p className="text-[10px] text-muted-foreground">Projects</p>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary/50 text-center">
                        <p className="text-lg font-bold text-primary">{s.tasksCompleted}/{s.tasksTotal}</p>
                        <p className="text-[10px] text-muted-foreground">Tasks</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Area progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Tip: Assign this area to goals/projects/tasks to make progress meaningful.
                      </p>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
