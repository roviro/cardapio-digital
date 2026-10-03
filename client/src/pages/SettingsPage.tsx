import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Settings, Save, Check, QrCode, Phone, Bike, Clock, Building2 } from 'lucide-react';

interface SettingsPageProps {
  onSettingsSaved?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsSaved }) => {
  const [formData, setFormData] = useState<Record<string, string>>({
    store_name: '',
    store_phone: '',
    pix_key: '',
    pix_name: '',
    pix_city: '',
    delivery_fee: '',
    estimated_time: '',
    store_address: '',
    store_is_open: '1'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await api.getSettings();
        setFormData((prev) => ({
          ...prev,
          ...data
        }));
      } catch (err) {
        console.error('Erro ao carregar configurações:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateSettings(formData);
      setSuccessMsg('Configurações salvas com sucesso!');
      if (onSettingsSaved) onSettingsSaved();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('Erro ao salvar configurações: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-16 text-slate-500 text-sm">
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="pb-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-sky-400" />
          <span>Configurações do Restaurante & PIX</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Altere informações de contato, chave PIX para pagamentos automáticos e taxas de entrega.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 pt-6">
        {/* Status da Loja & Identificação */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            Dados da Loja
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Nome do Estabelecimento
              </label>
              <input
                type="text"
                name="store_name"
                value={formData.store_name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Status da Loja
              </label>
              <select
                name="store_is_open"
                value={formData.store_is_open}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="1">🟢 Aberto para Pedidos</option>
                <option value="0">🔴 Fechado Temporariamente</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                WhatsApp que Recebe os Pedidos (com DDI + DDD)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="store_phone"
                  value={formData.store_phone}
                  onChange={handleChange}
                  placeholder="5511986531134"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Endereço Físico
              </label>
              <input
                type="text"
                name="store_address"
                value={formData.store_address}
                onChange={handleChange}
                placeholder="Rua das Flores, 123 - Centro"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* PIX Settings */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-400" />
            Configurações do PIX Oficial (Bacen Copia e Cola)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Chave PIX (CPF, CNPJ, Email ou Telefone)
              </label>
              <input
                type="text"
                name="pix_key"
                value={formData.pix_key}
                onChange={handleChange}
                placeholder="11986531134 ou contato@roviro.com.br"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Nome do Titular da Chave PIX
              </label>
              <input
                type="text"
                name="pix_name"
                value={formData.pix_name}
                onChange={handleChange}
                placeholder="Roviro Lanches"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Cidade da Conta
              </label>
              <input
                type="text"
                name="pix_city"
                value={formData.pix_city}
                onChange={handleChange}
                placeholder="SAO PAULO"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Entrega e Tempo */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Bike className="w-4 h-4 text-amber-400" />
            Entrega & Prazos
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Taxa Padrão de Entrega (R$)
              </label>
              <input
                type="text"
                name="delivery_fee"
                value={formData.delivery_fee}
                onChange={handleChange}
                placeholder="7.00"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Tempo Estimado de Entrega
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="estimated_time"
                  value={formData.estimated_time}
                  onChange={handleChange}
                  placeholder="30-45 min"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feedback & Submit */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
