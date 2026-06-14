'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { GrabitOrderWithItems, GrabitOrderStatus } from '@gradient365/gradient-commons';

const STATUS_LABELS: Record<GrabitOrderStatus, string> = {
  pending: 'Awaiting payment',
  new_order: 'Awaiting confirmation',
  confirmed: 'Order confirmed',
  prepping: 'Being prepared',
  ready: 'Ready for pickup!',
  completed: 'Picked up',
  cancelled: 'Cancelled',
};

export default function OrderPage() {
  const { id } = useParams<{ slug: string; id: string }>();
  const [order, setOrder] = useState<GrabitOrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/proxy/grabit/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Live updates via polling the backend (RDS-backed), replacing Supabase Realtime.
    const poll = setInterval(() => {
      fetch(`/api/proxy/grabit/orders/${id}`)
        .then((res) => res.json())
        .then((data) => setOrder(data))
        .catch(() => {});
    }, 4000);

    return () => clearInterval(poll);
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          color: 'var(--g-muted)',
          fontSize: '17px',
        }}
      >
        Loading…
      </div>
    );
  }

  if (!order) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          color: 'var(--g-muted)',
          fontSize: '17px',
        }}
      >
        Order not found
      </div>
    );
  }

  const pickupTime = new Date(order.pickup_slot).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const total = order.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '24px 16px',
      }}
    >
      {order.status === 'ready' && (
        <div
          style={{
            backgroundColor: 'var(--g-amber)',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
          <h2
            style={{
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 700,
              margin: '0 0 4px',
            }}
          >
            Your order is ready!
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '15px',
              margin: 0,
            }}
          >
            Head to the counter to pick up
          </p>
        </div>
      )}

      {/* Order card */}
      <div
        style={{
          backgroundColor: 'var(--g-surface)',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '12px',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: 'var(--g-muted)',
            margin: '0 0 4px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Order
        </p>
        <p
          style={{
            fontSize: '17px',
            fontWeight: 600,
            color: 'var(--g-text)',
            margin: '0 0 12px',
          }}
        >
          #{order.id}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: '15px',
              color: 'var(--g-text)',
            }}
          >
            {STATUS_LABELS[order.status]}
          </span>
          <span
            style={{
              fontSize: '14px',
              color: 'var(--g-muted)',
            }}
          >
            Pickup {pickupTime}
          </span>
        </div>
      </div>

      {/* Items card */}
      <div
        style={{
          backgroundColor: 'var(--g-surface)',
          borderRadius: '14px',
          padding: '20px',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            color: 'var(--g-muted)',
            margin: '0 0 12px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Items
        </p>

        {order.items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '10px',
              marginBottom: '10px',
              borderBottom: index < order.items.length - 1 ? '1px solid var(--g-border)' : 'none',
            }}
          >
            <span
              style={{
                fontSize: '15px',
                color: 'var(--g-text)',
              }}
            >
              {item.menu_item_name} × {item.quantity}
            </span>
            <span
              style={{
                fontSize: '15px',
                color: 'var(--g-text)',
                fontWeight: 500,
              }}
            >
              ₹{item.unit_price * item.quantity}
            </span>
          </div>
        ))}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '10px',
            borderTop: '1px solid var(--g-border)',
          }}
        >
          <span
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--g-text)',
            }}
          >
            Total
          </span>
          <span
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--g-text)',
            }}
          >
            ₹{total}
          </span>
        </div>
      </div>
    </div>
  );
}
