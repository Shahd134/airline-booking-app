import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const styles = {
  error: { wrap: 'bg-bad/5 border-bad/20 text-bad', Icon: AlertCircle },
  success: { wrap: 'bg-good/5 border-good/20 text-good', Icon: CheckCircle2 },
  info: { wrap: 'bg-sky/5 border-sky/20 text-sky', Icon: Info },
};

export default function Alert({ type = 'info', children }) {
  if (!children) return null;
  const { wrap, Icon } = styles[type] || styles.info;
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${wrap}`}>
      <Icon size={17} className="mt-0.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
