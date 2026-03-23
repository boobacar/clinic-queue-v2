import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, apiFetch } from '../api';
import logo from '../assets/logo.jpg';

const BRAND_GOLD = '#ad9d64';
const BRAND_PINK = '#bb2988';

const mapHistory = (rows) =>
  rows.map((item) => ({
    ticketId: item.ticket_id,
    nom: item.nom,
    prenom: item.prenom,
    roomId: item.called_room,
    calledAt: item.called_time,
  }));

const Display = () => {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [clock, setClock] = useState(() => new Date());
  const [status, setStatus] = useState('Connecté');

  const loadHistory = async () => {
    try {
      const data = await apiFetch('/api/history?limit=3');
      const mapped = mapHistory(data);
      setHistory(mapped);
      if (!current && mapped.length > 0) setCurrent(mapped[0]);
    } catch {
      setStatus('Mode dégradé (polling)');
    }
  };

  useEffect(() => {
    loadHistory();
    const poll = setInterval(loadHistory, 5000);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => setStatus('Connecté'));
    socket.on('disconnect', () => setStatus('Déconnecté - reconnexion...'));

    socket.on('call', (payload) => {
      const call = {
        ticketId: payload.ticketId,
        nom: payload.nom,
        prenom: payload.prenom,
        roomId: payload.roomId,
        calledAt: payload.calledAt,
      };
      setCurrent(call);
      setHistory((prev) => [call, ...prev].slice(0, 3));
    });

    return () => socket.close();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        color: '#fff',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
        background:
          `radial-gradient(circle at top left, ${BRAND_GOLD}44 0%, transparent 40%), ` +
          `radial-gradient(circle at bottom right, ${BRAND_PINK}44 0%, transparent 35%), ` +
          '#0b1020',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={logo}
            alt="Clinique Dentaire Dabia"
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${BRAND_GOLD}` }}
          />
          <div>
            <div style={{ fontSize: 13, opacity: 0.85, letterSpacing: 1 }}>CLINIQUE DENTAIRE</div>
            <h1 style={{ margin: 0, fontSize: 30, color: '#fff' }}>Dabia — Salle d’attente</h1>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{clock.toLocaleTimeString('fr-FR')}</div>
          <div
            style={{
              fontSize: 13,
              color: status.startsWith('Connecté') ? '#86efac' : '#fca5a5',
              background: '#00000040',
              padding: '4px 8px',
              borderRadius: 999,
              display: 'inline-block',
            }}
          >
            {status}
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#111a33',
          borderRadius: 18,
          padding: 28,
          marginBottom: 18,
          border: `1px solid ${BRAND_GOLD}55`,
          boxShadow: '0 10px 24px rgba(0,0,0,0.28)',
        }}
      >
        <div style={{ fontSize: 20, opacity: 0.95, color: '#fde68a' }}>Appel en cours</div>
        <div style={{ marginTop: 14, fontSize: 66, fontWeight: 700, lineHeight: 1.1, color: '#fff' }}>
          {current ? `Ticket ${current.ticketId} → Salle ${current.roomId}` : 'En attente du prochain appel'}
        </div>
        {current && (
          <div style={{ marginTop: 10, fontSize: 32, color: '#fbcfe8' }}>
            {current.prenom} {current.nom}
          </div>
        )}
      </div>

      <div
        style={{
          background: '#111a33',
          borderRadius: 18,
          padding: 20,
          border: `1px solid ${BRAND_PINK}66`,
          boxShadow: '0 8px 20px rgba(0,0,0,0.24)',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 8, color: '#f9a8d4' }}>3 derniers appels</h2>
        {history.length === 0 ? (
          <div style={{ opacity: 0.8 }}>Aucun appel pour le moment</div>
        ) : (
          history.map((item, idx) => (
            <div
              key={`${item.ticketId}-${item.calledAt}-${idx}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderTop: idx ? '1px solid #334155' : 'none',
              }}
            >
              <div style={{ fontSize: 24 }}>{`Ticket ${item.ticketId} → Salle ${item.roomId}`}</div>
              <div style={{ opacity: 0.9, color: '#cbd5e1' }}>
                {new Date(item.calledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Display;
