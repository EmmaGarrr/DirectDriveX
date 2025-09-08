"use client";

import { useState } from "react";
import { AccessRule, UseAccessRulesReturn } from "@/types/security";
import { Plus, Edit, Trash2 } from "lucide-react";
import { RuleEditModal } from "./RuleEditModal";
import { cn } from "@/lib/utils";

interface AccessRulesTabProps {
  accessRules: UseAccessRulesReturn;
}

export function AccessRulesTab({ accessRules }: AccessRulesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AccessRule | null>(null);

  const { rules, loading, error } = accessRules;

  const handleAddRule = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: AccessRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleSaveRule = async (rule: AccessRule) => {
    try {
      if (editingRule) {
        await accessRules.updateAccessRule(editingRule.rule_name, rule);
      } else {
        await accessRules.createAccessRule(rule);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving access rule:', error);
    }
  };

  const getActionBadgeClass = (action: AccessRule['action']) => {
    switch (action) {
      case 'allow': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'deny': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'rate_limit': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400';
    }
  };

  return (
    <div className="p-6 border shadow-lg bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-slate-400/20 dark:border-slate-400/10 rounded-2xl shadow-slate-900/5 dark:shadow-black/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">IP Access Rules ({rules.length})</h3>
        <button onClick={handleAddRule} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"><Plus className="w-4 h-4 mr-2" /> Add Rule</button>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
          <thead className="text-xs uppercase text-slate-700 bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Rule Name</th>
              <th scope="col" className="px-6 py-3">IP Pattern</th>
              <th scope="col" className="px-6 py-3">Action</th>
              <th scope="col" className="px-6 py-3">Priority</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:bg-slate-800 divide-slate-200 dark:divide-slate-700">
            {rules.map(rule => (
              <tr key={rule.rule_name}>
                <td className="px-6 py-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${rule.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{rule.rule_name}</td>
                <td className="px-6 py-4"><code className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700">{rule.ip_pattern}</code></td>
                <td className="px-6 py-4"><span className={cn("px-2 py-1 text-xs font-medium rounded-full", getActionBadgeClass(rule.action))}>{rule.action}</span></td>
                <td className="px-6 py-4">{rule.priority}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleEditRule(rule)}><Edit className="w-4 h-4" /></button>
                    <button className="p-2 transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RuleEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRule}
        rule={editingRule}
      />
    </div>
  );
}