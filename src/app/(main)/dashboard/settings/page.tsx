import { Separator } from "@/components/ui/separator";
import { SessionManager } from "@/modules/settings/SessionManager";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold font-pop">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and security preferences.
        </p>
      </div>
      <Separator />

      <SessionManager />
    </div>
  );
}
