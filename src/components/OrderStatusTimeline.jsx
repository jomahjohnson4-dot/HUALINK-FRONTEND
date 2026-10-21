import { Truck, MapPin, PackageCheck, Flag } from 'lucide-react';
import {
  STATUS_STEP,
  corridorStops,
  stepTone,
  stageLabelFor,
} from '../data/deliveryRoutes';

/**
 * The four stage dispatch timeline.
 *
 * Shared by the order list page and the dedicated tracking page so both
 * surfaces describe a shipment in exactly the same way. The copy is corridor
 * aware — "Dispatched from Dar es Salaam", "In Transit via Morogoro / Iringa"
 * — because the route is what makes the map legible.
 */
export default function OrderStatusTimeline({
  status = 'PENDING',
  orderDate,
  route = null,
  className = '',
}) {
  const key = String(status || 'PENDING').toUpperCase();
  const activeStep = STATUS_STEP[key] ?? 1;

  const origin = route?.origin?.city || 'Central Hub';
  const destination = route?.destination?.city || 'Regional Depot';
  const stops = corridorStops(route);

  const steps = [
    {
      step: 1,
      title: 'Order Confirmed & Placed',
      detail: orderDate || 'Awaiting confirmation',
      done: activeStep >= 1,
    },
    {
      step: 2,
      title: `Dispatched from ${origin}`,
      detail:
        activeStep >= 2
          ? `Package processed & handed to carrier at ${origin}`
          : 'Pending verification',
      done: activeStep >= 2,
    },
    {
      step: 3,
      title: stops
        ? `In Transit via ${stops}`
        : `In Transit to ${destination}`,
      detail:
        activeStep >= 3
          ? `En route to ${destination}`
          : 'Pending transit',
      done: activeStep >= 3,
    },
    {
      step: 4,
      title: 'Delivered & Customer Verification',
      detail:
        activeStep >= 4
          ? 'Order delivered and verified successfully'
          : 'Pending delivery',
      done: activeStep >= 4,
    },
  ];

  const stageIcon = {
    1: PackageCheck,
    2: Truck,
    3: MapPin,
    4: Flag,
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
        <Truck size={16} className="text-red-500" />
        <span>DISPATCH & FULFILL PROGRESS</span>
        <span className="ml-auto normal-case tracking-normal text-slate-400 font-semibold">
          {stageLabelFor(key)}
        </span>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step) => {
          const Icon = stageIcon[step.step];
          const isActive = activeStep === step.step;

          return (
            <div
              key={step.step}
              className="relative flex items-start justify-between gap-4"
            >
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step.done
                    ? step.step === 4
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                      : 'bg-red-600 text-white ring-4 ring-red-50'
                    : 'bg-slate-200 border-2 border-white'
                }`}
              >
                {step.done ? '✓' : ''}
              </div>

              <div>
                <h4
                  className={`text-xs font-bold ${
                    step.done ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{step.detail}</p>
              </div>

              {isActive ? (
                <span
                  className={`px-2.5 py-1 border rounded-full text-[10px] font-bold whitespace-nowrap ${stepTone(
                    step.step
                  )}`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Icon size={11} />
                    {stageLabelFor(key)}
                  </span>
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
