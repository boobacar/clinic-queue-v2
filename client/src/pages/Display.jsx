import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL, apiFetch } from '../api';

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
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Clinique Dentaire Dabia — Salle d’attente</h1>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22 }}>{clock.toLocaleTimeString('fr-FR')}</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>{status}</div>
        </div>
      </div>

      <div style={{ background: '#1e293b', borderRadius: 16, padding: 28, marginBottom: 18 }}>
        <div style={{ fontSize: 20, opacity: 0.9 }}>En cours</div>
        <div style={{ marginTop: 14, fontSize: 66, fontWeight: 700, lineHeight: 1.1 }}>
          {current ? `Ticket ${current.ticketId} → Salle ${current.roomId}` : 'En attente du prochain appel'}
        </div>
        {current && (
          <div style={{ marginTop: 10, fontSize: 30, opacity: 0.95 }}>
            {current.prenom} {current.nom}
          </div>
        )}
      </div>

      <div style={{ background: '#1e293b', borderRadius: 16, padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>3 derniers appels</h2>
        {history.length === 0 ? (
          <div style={{ opacity: 0.75 }}>Aucun appel pour le moment</div>
        ) : (
          history.map((item, idx) => (
            <div key={`${item.ticketId}-${item.calledAt}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: idx ? '1px solid #334155' : 'none' }}>
              <div style={{ fontSize: 22 }}>{`Ticket ${item.ticketId} → Salle ${item.roomId}`}</div>
              <div style={{ opacity: 0.85 }}>{new Date(item.calledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Display;
