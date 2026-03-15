import { GearIcon, BellIcon, PaletteIcon, CalendarIcon, ShieldIcon } from '@phosphor-icons/react'
import GrayScrollbar from '../components/GrayScrollbar'

function SettingsSection({ icon: Icon, title, children }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={20} style={{ color: 'var(--col-green-700)' }} />}
        <h2 className="text-lg font-semibold" style={{ color: 'var(--col-text-heading)' }}>
          {title}
        </h2>
      </div>
      <div
        className="rounded-xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--col-bg-card)',
          borderColor: 'var(--col-border)',
        }}
      >
        {children}
      </div>
    </section>
  )
}

function SettingsRow({ label, description, control, isFirst = false }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3"
      style={!isFirst ? { borderTop: '1px solid var(--col-border-light)' } : undefined}
    >
      <div>
        <p className="font-medium text-sm" style={{ color: 'var(--col-text-body)' }}>
          {label}
        </p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--col-text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {control && <div className="flex-shrink-0">{control}</div>}
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div
      className="flex-1 min-h-0 flex flex-col"
      style={{ backgroundColor: 'var(--col-bg-page)' }}
    >
      <GrayScrollbar>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--col-text-heading)' }}>
          Settings
        </h1>

        <SettingsSection icon={BellIcon} title="Notifications">
          <SettingsRow
            isFirst
            label="Daily reminder"
            description="Remind me to check my dailies"
            control={
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" defaultChecked={false} />
                <span className="text-sm" style={{ color: 'var(--col-text-body)' }}>On</span>
              </label>
            }
          />
          <SettingsRow
            label="Task due soon"
            description="Notify when a to-do is due within 24 hours"
            control={
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" defaultChecked={true} />
                <span className="text-sm" style={{ color: 'var(--col-text-body)' }}>On</span>
              </label>
            }
          />
        </SettingsSection>

        <SettingsSection icon={PaletteIcon} title="Appearance">
          <SettingsRow
            isFirst
            label="Theme"
            description="Light theme only for now"
            control={
              <span className="text-sm px-2 py-1 rounded" style={{ color: 'var(--col-text-muted)', backgroundColor: 'var(--col-bg-card-hover)' }}>
                Light
              </span>
            }
          />
        </SettingsSection>

        <SettingsSection icon={CalendarIcon} title="Preferences">
          <SettingsRow
            isFirst
            label="Week starts on"
            description="First day of the week in calendar views"
            control={
              <select
                className="text-sm rounded-lg border px-3 py-1.5 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--col-bg-card)',
                  borderColor: 'var(--col-border)',
                  color: 'var(--col-text-body)',
                }}
                defaultValue="sunday"
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
              </select>
            }
          />
        </SettingsSection>

        <SettingsSection icon={ShieldIcon} title="Account">
          <SettingsRow
            isFirst
            label="Change password"
            description="Coming soon"
            control={
              <span className="text-xs" style={{ color: 'var(--col-text-muted)' }}>—</span>
            }
          />
        </SettingsSection>
      </div>
      </GrayScrollbar>
    </div>
  )
}
