import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import StatCard from './components/StatCard';
import RevenueGoal from './components/RevenueGoal';
import ProjectGoal from './components/ProjectGoal';
import NotificationPanel from './components/NotificationPanel';
import TvDashboard from './components/TvDashboard';
import { authService } from './services/authService';
import { geminiService } from './services/geminiService';
import { AuthSession, ViewState, Project, Client, AppNotification, User, DeliveryFile, FinancialTransaction, AlterationItem, PixPaymentResponse } from './types';
import { 
  Building2, 
  Users, 
  Cloud,
  Plus, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Mail, 
  Globe, 
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  ChevronRight,
  Film,
  UserPlus,
  CheckSquare,
  Activity,
  Zap,
  X,
  Search,
  Bell,
  AlertTriangle,
  FileText,
  ThumbsUp,
  MessageSquareWarning,
  Lock,
  Upload,
  Download,
  FileVideo,
  Send,
  Edit2,
  Archive,
  Layers,
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowDown,
  ArrowUp,
  PieChart as PieChartIcon,
  Repeat,
  BarChart3,
  CreditCard,
  Key,
  Eye,
  EyeOff,
  Copy,
  Folder,
  File,
  CornerUpLeft,
  Home,
  QrCode,
  Smartphone,
  Sparkles,
  Loader2,
  ListTodo,
  Clapperboard,
  Mic2,
  Music,
  Palette,
  Wand2,
  PlayCircle,
  Settings,
  Paperclip,
  Save,
  RefreshCw,
  Mic,
  Square
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart, 
  Pie,
  Cell
} from 'recharts';

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    'em_revisao': { color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Revisão' },
    'ativo': { color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Em Produção' },
    'concluido': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Aguardando Aprovação' },
    'aprovado': { color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Aprovado' },
    'arquivado': { color: 'text-zinc-500', bg: 'bg-zinc-500/10', label: 'Arquivado' },
    'paid': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Pago' },
    'pending': { color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Pendente' },
  };
  
  const style = config[status as keyof typeof config] || config['arquivado'];

  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-transparent ${style.bg} ${style.color}`}>
      {style.label}
    </span>
  );
};

interface AiGem {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    systemPrompt: string;
}

interface AttachedFile {
    name: string;
    mimeType: string;
    data: string;
}

export const App = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  
  // Modal States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isDeleteClientModalOpen, setIsDeleteClientModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false); 
  const [isAlterationModalOpen, setIsAlterationModalOpen] = useState(false); 
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false); 
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false); 
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false); 
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); 
  const [isGemConfigModalOpen, setIsGemConfigModalOpen] = useState(false);

  // Payment State
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [pixData, setPixData] = useState<PixPaymentResponse | null>(null);

  const [clientToDeleteId, setClientToDeleteId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null); 

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [gems, setGems] = useState<AiGem[]>([
    {
        id: 'script_master',
        title: 'Roteirista Institucional',
        description: 'Decupagem técnica de depoimentos e estruturação de narrativas emocionais.',
        icon: <FileText />,
        color: 'bg-pink-500',
        systemPrompt: 'Você é um Especialista em Pós-Produção de Vídeo...'
    },
    {
        id: 'tech_fixer',
        title: 'Resolve Tudo (Premiere/DaVinci)',
        description: 'Ajuda com erros técnicos, atalhos e configurações de exportação.',
        icon: <Wand2 />,
        color: 'bg-blue-500',
        systemPrompt: 'Você é um Engenheiro de Vídeo Sênior...'
    },
    {
        id: 'creative_spark',
        title: 'Diretor Criativo',
        description: 'Brainstorming de ideias visuais, b-rolls e transições.',
        icon: <Sparkles />,
        color: 'bg-purple-500',
        systemPrompt: 'Você é um Diretor Criativo premiado...'
    },
    {
        id: 'sound_architect',
        title: 'Maestro Sônico (Suno AI)',
        description: 'Especialista em Engenharia de Prompts para Suno AI.',
        icon: <Music />,
        color: 'bg-amber-500',
        systemPrompt: 'Você é o "Maestro Sônico"...'
    }
  ]);

  const [selectedGem, setSelectedGem] = useState<AiGem | null>(null);
  const [gemInput, setGemInput] = useState('');
  const [gemOutput, setGemOutput] = useState('');
  const [isGemLoading, setIsGemLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [editingGemId, setEditingGemId] = useState<string | null>(null);
  const [tempPrompt, setTempPrompt] = useState('');

  const [statusFilter, setStatusFilter] = useState<string>('all'); 
  
  const [cloudPath, setCloudPath] = useState<string[]>([]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });
  const [newEditor, setNewEditor] = useState({ name: '', email: '' });
  
  // Alteration State
  const [alterationText, setAlterationText] = useState(''); 
  const [alterationAudio, setAlterationAudio] = useState<{name: string, data: string, mimeType: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [newProject, setNewProject] = useState({
    name: '',
    clientId: '',
    editorId: '',
    value: '',
    deadline: '',
    description: '',
    expectedDeliveries: 1 
  });

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [newTransaction, setNewTransaction] = useState<Partial<FinancialTransaction>>({
    description: '',
    amount: 0,
    type: 'expense',
    category: 'Editores',
    date: new Date().toISOString().split('T')[0],
    status: 'paid',
    isRecurring: false,
    clientId: ''
  });
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedEditorId, setSelectedEditorId] = useState<string | null>(null);
  
  const [revealedPasswords, setRevealedPasswords] = useState<{[key: string]: boolean}>({});

  const [clients, setClients] = useState<Client[]>([
    { id: 'c1', name: 'Dan', company: 'Oceano Azives', phone: '11999999999', status: 'closed', email: 'dan@oceanoazives.com' },
    { id: 'c2', name: 'Ed', company: 'Nova', phone: '11988888888', status: 'closed', email: 'ed@nova.com' },
    { id: 'c3', name: 'Gabriel', company: 'Imperial Drones', phone: '11977777777', status: 'negotiating', email: 'gabriel@imperialdrones.com' },
  ]);

  const [editors, setEditors] = useState<User[]>([
    { id: 'e1', name: 'Rafaela', email: 'rafaela@acriativis.com', role: 'editor', company: 'Acriativis Studio' },
    { id: 'e2', name: 'Micael', email: 'micael@acriativis.com', role: 'editor', company: 'Acriativis Studio' },
    { id: 'e3', name: 'Vitor', email: 'vitor@acriativis.com', role: 'editor', company: 'Acriativis Studio' },
  ]);

  const defaultChecklist = [
    { id: '1', label: 'Ingest & Backup', completed: false },
    { id: '2', label: 'Decupagem', completed: false },
    { id: '3', label: 'Roteiro / Estrutura', completed: false },
    { id: '4', label: 'Primeiro Corte', completed: false },
    { id: '5', label: 'Sound Design', completed: false },
    { id: '6', label: 'Color Grading', completed: false },
    { id: '7', label: 'Export Final', completed: false }
  ];

  const [projects, setProjects] = useState<Project[]>([
    { 
      id: 'p1', 
      name: 'Retrospectiva 2024', 
      client: 'Oceano Azives', 
      value: 2500, 
      deadline: '2024-12-20', 
      status: 'ativo',
      description: 'Edição completa do evento anual.',
      clientId: 'c1',
      editorId: 'e1',
      expectedDeliveries: 1,
      deliveries: [
        { id: 'f1', name: 'Retrospectiva_V1.mp4', url: '#', type: 'video/mp4', uploadedAt: '2024-12-18T10:00:00Z', size: '150 MB' },
        { id: 'f2', name: 'Cortes_Instagram.zip', url: '#', type: 'application/zip', uploadedAt: '2024-12-19T14:30:00Z', size: '45 MB' }
      ],
      deliveryChecklist: [
          { id: '1', label: 'Ingest & Backup', completed: true },
          { id: '2', label: 'Decupagem', completed: true },
          { id: '3', label: 'Roteiro / Estrutura', completed: false },
          { id: '4', label: 'Primeiro Corte', completed: false },
          { id: '5', label: 'Sound Design', completed: false },
          { id: '6', label: 'Color Grading', completed: false },
          { id: '7', label: 'Export Final', completed: false }
      ],
      alterations: []
    },
    { 
      id: 'p2', 
      name: 'Reels Institucional', 
      client: 'Nova', 
      value: 800, 
      deadline: '2024-10-15', 
      status: 'em_revisao',
      clientId: 'c2',
      editorId: 'e2',
      expectedDeliveries: 3,
      deliveries: [],
      deliveryChecklist: [...defaultChecklist],
      alterations: []
    },
    { 
        id: 'p3', 
        name: 'Cobertura Drone SP', 
        client: 'Imperial Drones', 
        value: 1200, 
        deadline: '2024-11-01', 
        status: 'concluido',
        clientId: 'c3',
        editorId: 'e3',
        expectedDeliveries: 5,
        deliveries: [],
        deliveryChecklist: defaultChecklist.map(i => ({...i, completed: true})),
        alterations: []
    },
    { 
        id: 'p4', 
        name: 'Teaser Verão', 
        client: 'Oceano Azives', 
        value: 1500, 
        deadline: '2025-01-10', 
        status: 'ativo',
        clientId: 'c1',
        editorId: 'e1',
        expectedDeliveries: 1,
        deliveries: [],
        deliveryChecklist: [...defaultChecklist],
        alterations: []
    }
  ]);

  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([
    { id: 't1', description: 'Entrada Projeto Oceano', amount: 1000, type: 'income', category: 'Oceano Azives', clientId: 'c1', date: '2024-10-01', status: 'paid', isRecurring: false },
    { id: 't2', description: 'Licença Adobe Creative Cloud', amount: 350, type: 'expense', category: 'Software', date: '2024-10-05', status: 'paid', isRecurring: true },
    { id: 't3', description: 'Editor Motion Graphics', amount: 600, type: 'expense', category: 'Editores', date: '2024-10-08', status: 'paid', isRecurring: false },
    { id: 't4', description: 'Entrada Projeto Nova', amount: 800, type: 'income', category: 'Nova', clientId: 'c2', date: '2024-10-12', status: 'pending', isRecurring: false },
    { id: 't5', description: 'Hospedagem Google Drive', amount: 100, type: 'expense', category: 'Software', date: '2024-10-15', status: 'paid', isRecurring: true },
    { id: 't6', description: 'Retainer Mensal', amount: 1500, type: 'income', category: 'Imperial Drones', clientId: 'c3', date: '2024-10-20', status: 'paid', isRecurring: true },
    { id: 't7', description: 'Compra SSD 2TB', amount: 900, type: 'expense', category: 'Equipamento', date: '2024-10-22', status: 'paid', isRecurring: false },
  ]);

  useEffect(() => {
    const restoredSession = authService.getSession();
    if (restoredSession) setSession(restoredSession);
  }, []);

  const handleLogin = (newSession: AuthSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
  };

  // ... (Keep existing handler functions: handleMarkRead, handleClearAll, etc. until calculateStats) ...
  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setIsNotificationPanelOpen(false);
  };

  const handleToggleChecklist = (projectId: string, itemId: string) => {
    if (session?.user.role === 'client') return;
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const currentList = p.deliveryChecklist || defaultChecklist;
      const newList = currentList.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      return { ...p, deliveryChecklist: newList };
    }));
  };

  const handleToggleAlteration = (projectId: string, itemId: string) => {
    if (session?.user.role === 'client') return;
    setProjects(prev => prev.map(p => {
        if (p.id !== projectId) return p;
        const currentAlterations = p.alterations || [];
        const newAlterations = currentAlterations.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...p, alterations: newAlterations };
    }));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, projectId: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile: DeliveryFile = {
        id: `f-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file), 
        type: file.type,
        uploadedAt: new Date().toISOString(),
        size: formatBytes(file.size)
      };
      setProjects(prev => prev.map(p => {
        if (p.id !== projectId) return p;
        const currentDeliveries = p.deliveries || [];
        return { ...p, deliveries: [newFile, ...currentDeliveries] };
      }));
    }
  };

  const handleDeleteDelivery = (projectId: string, fileId: string) => {
    setProjects(prev => prev.map(p => {
        if (p.id !== projectId) return p;
        return { 
            ...p, 
            deliveries: p.deliveries?.filter(f => f.id !== fileId) 
        };
    }));
  };

  const handleAssignEditor = (projectId: string, editorId: string) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, editorId } : p));
  };

  const handleUpdateProjectStatus = (projectId: string, newStatus: any) => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus } : p));
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        } else {
            reject(new Error("Failed to convert blob to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(audioBlob);
        setAlterationAudio({
          name: `Gravação_${new Date().toLocaleTimeString()}.webm`,
          data: base64,
          mimeType: 'audio/webm'
        });
        
        // Parar todas as tracks para liberar o microfone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      alert("Permissão de microfone negada ou dispositivo não encontrado.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmitAlteration = async () => {
    if (!selectedProjectId || (!alterationText.trim() && !alterationAudio)) return;
    setIsGeneratingAI(true);
    try {
        const aiResponse = await geminiService.parseClientFeedback(alterationText, alterationAudio ? { data: alterationAudio.data, mimeType: alterationAudio.mimeType } : undefined);
        
        const tasks = aiResponse.tasks || [];
        const transcription = aiResponse.transcription || "";
        
        const newItems: AlterationItem[] = tasks.map((t: any) => ({
            id: `alt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            task: t.task,
            completed: false,
            sourceText: transcription || alterationText
        }));
        
        setProjects(prev => prev.map(p => {
            if (p.id !== selectedProjectId) return p;
            return { 
                ...p, 
                status: 'em_revisao', 
                activeFeedback: transcription || alterationText, 
                alterations: [...(p.alterations || []), ...newItems] 
            };
        }));
        
        const project = projects.find(p => p.id === selectedProjectId);
        if (project) {
            const newNotif: AppNotification = {
                id: `notif-${Date.now()}`,
                title: `Ajustes Recebidos: ${project.name}`,
                message: `IA processou ${newItems.length} tarefas${alterationAudio ? ' a partir do áudio' : ''}.`,
                type: 'warning',
                timestamp: new Date(),
                read: false,
                projectId: project.id
            };
            setNotifications(prev => [newNotif, ...prev]);
        }
        
        setIsAlterationModalOpen(false);
        setAlterationText('');
        setAlterationAudio(null);
        alert("IA processou o feedback e atualizou o checklist!");
    } catch (error) {
        console.error("Erro na IA:", error);
        alert("Erro ao processar feedback com IA. Tente novamente.");
    } finally {
        setIsGeneratingAI(false);
    }
  };

  const handleGemFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        try {
            const base64Data = await blobToBase64(file);
            setAttachedFiles(prev => [...prev, {
                name: file.name,
                mimeType: file.type,
                data: base64Data
            }]);
        } catch (error) {
            console.error("Error reading file", error);
            alert("Erro ao ler arquivo. Tente um arquivo menor ou outro formato.");
        }
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRunGem = async () => {
    if (!selectedGem || (!gemInput.trim() && attachedFiles.length === 0)) return;
    setIsGemLoading(true);
    setGemOutput(''); 

    try {
        const parts = [];
        if (gemInput.trim()) {
            parts.push({ text: gemInput });
        }
        
        attachedFiles.forEach(file => {
            parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data
                }
            });
        });

        const result = await geminiService.runCustomGem(selectedGem.systemPrompt, parts);
        setGemOutput(result || "Sem resposta da IA.");
        setAttachedFiles([]); 
        setGemInput(''); 
    } catch (error) {
        console.error(error);
        setGemOutput("Erro ao processar sua solicitação. Verifique se o arquivo é suportado.");
    } finally {
        setIsGemLoading(false);
    }
  };

  const handleOpenGemConfig = (gem: AiGem, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingGemId(gem.id);
      setTempPrompt(gem.systemPrompt);
      setIsGemConfigModalOpen(true);
  };

  const handleSaveGemConfig = () => {
      if (editingGemId) {
          setGems(prev => prev.map(g => g.id === editingGemId ? { ...g, systemPrompt: tempPrompt } : g));
          if (selectedGem?.id === editingGemId) {
              setSelectedGem(prev => prev ? { ...prev, systemPrompt: tempPrompt } : null);
          }
      }
      setIsGemConfigModalOpen(false);
      setEditingGemId(null);
  };

  const handleGeneratePix = async () => {
    if (!session) return;
    setIsGeneratingPix(true);
    setPixData(null);

    const { balance } = getClientFinancialStatus(session.user.id);
    if (balance <= 0) {
        setIsGeneratingPix(false);
        return;
    }

    const staticPixCode = "00020126580014br.gov.bcb.pix013646d3834d-decf-4a94-8e85-8d4df339d4b55204000053039865802BR5910ACRIATIVIS6009Sao Paulo610901227-20062230519daqr7508473046361896304D8CD";

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setPixData({
        id: Date.now(),
        status: 'pending',
        status_detail: 'pending_waiting_transfer',
        date_created: new Date().toISOString(),
        date_of_expiration: new Date(Date.now() + 86400000).toISOString(),
        point_of_interaction: {
            transaction_data: {
                qr_code: staticPixCode,
                qr_code_base64: '', 
                ticket_url: ''
            }
        }
    });

    setIsGeneratingPix(false);
  };
  
  useEffect(() => {
    if (isPaymentModalOpen) {
        handleGeneratePix();
    } else {
        setPixData(null); 
        setIsGeneratingPix(false);
    }
  }, [isPaymentModalOpen]);

  const handleClientApprove = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, status: 'aprovado' };
    }));

    if (project) {
        const newNotif: AppNotification = {
            id: `notif-${Date.now()}`,
            title: `Entrega Aprovada: ${project.name}`,
            message: `O cliente aprovou o projeto. Entrega contabilizada na meta do editor!`,
            type: 'info',
            timestamp: new Date(),
            read: false,
            projectId: project.id
        };
        setNotifications(prev => [newNotif, ...prev]);
    }

    alert("Projeto Aprovado! Meta atualizada e editor notificado.");
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `c${Date.now()}`;
    const client: Client = {
      id: newId,
      name: newClient.name,
      company: newClient.company,
      email: newClient.email,
      phone: newClient.phone,
      status: 'lead'
    };
    setClients([...clients, client]);
    const newUser: User = {
      id: newId,
      name: newClient.name,
      email: newClient.email,
      role: 'client',
      company: newClient.company
    };
    authService.addUser(newUser);
    setIsClientModalOpen(false);
    setNewClient({ name: '', company: '', email: '', phone: '' });
  };

  const handleDeleteClient = () => {
    if (clientToDeleteId) {
      setClients(clients.filter(c => c.id !== clientToDeleteId));
      authService.removeUser(clientToDeleteId);
      setIsDeleteClientModalOpen(false);
      setClientToDeleteId(null);
    }
  };

  const handleAddEditor = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `e${Date.now()}`;
    const editor: User = {
      id: newId,
      name: newEditor.name,
      email: newEditor.email,
      role: 'editor',
      company: 'Acriativis Studio'
    };
    setEditors([...editors, editor]);
    authService.addUser(editor);
    setIsEditorModalOpen(false);
    setNewEditor({ name: '', email: '' });
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const clientObj = clients.find(c => c.id === newProject.clientId);
    const clientName = clientObj ? clientObj.company : 'Cliente Desconhecido';

    const project: Project = {
      id: `p${Date.now()}`,
      name: newProject.name,
      client: clientName,
      clientId: newProject.clientId,
      editorId: newProject.editorId,
      value: Number(newProject.value),
      deadline: newProject.deadline,
      description: newProject.description,
      status: 'ativo',
      deliveries: [],
      expectedDeliveries: newProject.expectedDeliveries,
      deliveryChecklist: [...defaultChecklist],
      alterations: []
    };

    setProjects([project, ...projects]);
    setIsProjectModalOpen(false);
    setNewProject({ name: '', clientId: '', editorId: '', value: '', deadline: '', description: '', expectedDeliveries: 1 });
  };

  const handleOpenEditProject = (project: Project) => {
      setEditingProject({ ...project });
      setIsEditProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingProject) return;

      setProjects(prev => prev.map(p => p.id === editingProject.id ? editingProject : p));
      setIsEditProjectModalOpen(false);
      setEditingProject(null);
  };

  const handleArchiveProject = (project: Project) => {
    setProjects(prev => prev.map(p => p.id === project.id ? { ...p, status: 'arquivado' } : p));
    setSelectedProjectId(null); 
  };

  const handleOpenDeleteProject = (project: Project) => {
      setProjectToDelete(project);
      setIsDeleteProjectModalOpen(true);
  };

  const handleDeleteProject = () => {
    if (projectToDelete) {
        setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
        setIsDeleteProjectModalOpen(false);
        setProjectToDelete(null);
        setSelectedProjectId(null); 
    }
  };

  const getMockPassword = (u: User) => {
    if (u.role === 'admin') return 'Acriativis@1245';
    if (u.role === 'editor') return `${u.name.toLowerCase()}@acriativis`;
    if (u.role === 'client') return `${u.name}@acriativis`;
    return '****';
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords(prev => ({
        ...prev,
        [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copiado: ${text}`);
  };

  const getClientFinancialStatus = (clientId: string) => {
    const totalProjectValue = projects
        .filter(p => p.clientId === clientId && p.status !== 'arquivado')
        .reduce((acc, p) => acc + p.value, 0);

    const totalPaid = financialTransactions
        .filter(t => t.clientId === clientId && t.type === 'income' && t.status === 'paid')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = totalProjectValue - totalPaid; 

    return { totalProjectValue, totalPaid, balance };
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    let finalCategory = newTransaction.category || 'Outros';
    if (newTransaction.type === 'income' && newTransaction.clientId) {
        const client = clients.find(c => c.id === newTransaction.clientId);
        if (client) finalCategory = client.company;
    }

    const transaction: FinancialTransaction = {
      id: `t-${Date.now()}`,
      description: newTransaction.description || 'Sem descrição',
      amount: Number(newTransaction.amount),
      type: newTransaction.type as 'income' | 'expense',
      category: finalCategory,
      clientId: newTransaction.clientId,
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      status: newTransaction.status as 'paid' | 'pending',
      isRecurring: newTransaction.isRecurring
    };

    setFinancialTransactions(prev => [transaction, ...prev]);
    setIsTransactionModalOpen(false);
    setNewTransaction({ 
        description: '', 
        amount: 0, 
        type: 'expense', 
        category: 'Editores', 
        date: new Date().toISOString().split('T')[0], 
        status: 'paid', 
        isRecurring: false, 
        clientId: '' 
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setFinancialTransactions(prev => prev.filter(t => t.id !== id));
  };

  const calculateFinancials = () => {
    const totalIncome = financialTransactions.filter(t => t.type === 'income' && t.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = financialTransactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const totalSales = projects.filter(p => p.status !== 'arquivado').reduce((acc, p) => acc + p.value, 0);
    const receivables = Math.max(totalSales - totalIncome, 0);
    const netProfit = totalIncome - totalExpense;
    return { totalIncome, totalExpense, receivables, netProfit, totalSales };
  };

  const calculateProjectGoals = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const deliveredProjects = projects.filter(p => {
        const isDeliveredStatus = p.status === 'concluido' || p.status === 'aprovado';
        if (!isDeliveredStatus) return false;
        const deadlineDate = new Date(p.deadline);
        return deadlineDate.getMonth() === currentMonth && deadlineDate.getFullYear() === currentYear;
    });
    const teamDelivered = deliveredProjects.length;
    const myDelivered = session?.user.role === 'editor' 
        ? deliveredProjects.filter(p => p.editorId === session.user.id).length 
        : 0;
    return { teamDelivered, myDelivered };
  };

  const expensesByCategoryData = React.useMemo(() => {
    const categories: {[key: string]: number} = {};
    financialTransactions.filter(t => t.type === 'expense').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.keys(categories).map(key => ({ name: key, value: categories[key] }));
  }, [financialTransactions]);

  const incomeByClientData = React.useMemo(() => {
     const clientRevenue: {[key: string]: number} = {};
     financialTransactions.filter(t => t.type === 'income').forEach(t => {
        const label = t.category; 
        clientRevenue[label] = (clientRevenue[label] || 0) + t.amount;
     });
     return Object.keys(clientRevenue).map(key => ({ name: key, value: clientRevenue[key] }));
  }, [financialTransactions]);

  const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];

  if (!session) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  // TV DASHBOARD MODE INTERCEPT
  if (session.user.role === 'tv') {
      return <TvDashboard projects={projects} editors={editors} onLogout={handleLogout} />;
  }

  const userRole = session.user.role;
  const userId = session.user.id;
  const isClient = userRole === 'client';
  const isAdmin = userRole === 'admin';
  const isEditor = userRole === 'editor';

  const filteredProjects = projects.filter(p => {
    let hasPermission = false;
    if (isAdmin) hasPermission = true;
    else if (isClient) hasPermission = p.clientId === userId;
    else if (isEditor) hasPermission = p.editorId === userId;
    
    if (!hasPermission) return false;

    if (statusFilter === 'all') {
        return p.status !== 'arquivado';
    } else {
        return p.status === statusFilter;
    }
  });

  const calculateStats = () => {
    const totalRevenue = filteredProjects.reduce((acc, p) => p.status !== 'arquivado' ? acc + p.value : acc, 0);
    const activeProjectsCount = filteredProjects.filter(p => ['ativo', 'em_revisao'].includes(p.status)).length;
    const pendingStatus = isClient ? ['concluido'] : ['ativo', 'em_revisao']; 
    const pendingDeliveriesCount = filteredProjects.filter(p => pendingStatus.includes(p.status)).length;
    return { totalRevenue, activeProjectsCount, pendingDeliveriesCount };
  };

  const { totalRevenue, activeProjectsCount, pendingDeliveriesCount } = calculateStats();
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const { totalIncome, totalExpense, receivables, netProfit, totalSales } = calculateFinancials();
  const { teamDelivered, myDelivered } = calculateProjectGoals();

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-700 relative">
            {isNotificationPanelOpen && (
              <NotificationPanel 
                notifications={notifications}
                onMarkRead={handleMarkRead}
                onClearAll={handleClearAll}
                onClose={() => setIsNotificationPanelOpen(false)}
              />
            )}

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white tracking-tighter mb-2">
                   {isClient ? `Olá, ${session.user.name}` : 'Visão Geral'}
                </h2>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                   <p className="text-zinc-400 text-xs font-medium tracking-wide">
                      {isClient ? 'Área do Cliente' : 'Sistema Operacional Online'}
                   </p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                 <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full backdrop-blur-md">
                    <Search size={14} className="text-zinc-500" />
                    <input type="text" placeholder="Buscar..." className="bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none w-24 lg:w-32" />
                 </div>
                 
                 {isAdmin && (
                    <button 
                      onClick={() => setIsCredentialsModalOpen(true)}
                      className="p-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
                      title="Gestão de Acessos"
                    >
                       <Key size={18} />
                    </button>
                 )}

                 <button 
                  onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                  className="relative p-2.5 bg-[#0A0A0A] border border-white/5 rounded-full hover:bg-white/5 transition-colors group"
                 >
                    <Bell size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0A0A]" />
                    )}
                 </button>

                 <div className="px-4 py-2 bg-[#0A0A0A] border border-white/5 rounded-full flex items-center gap-3 shadow-lg">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:inline">Hoje</span>
                    <span className="text-xs font-bold text-white">{new Date().toLocaleDateString('pt-BR')}</span>
                 </div>
              </div>
            </header>

            {isClient && (
              <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 mb-6 relative overflow-hidden">
                 {(() => {
                    const { balance } = getClientFinancialStatus(session.user.id);
                    const isDebt = balance > 0;
                    const isCredit = balance < 0;
                    
                    return (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-xl ${isDebt ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">Status Financeiro</h3>
                                    {isDebt ? (
                                        <p className="text-2xl font-medium text-red-400">Débito Pendente: R$ {balance.toLocaleString('pt-BR')}</p>
                                    ) : isCredit ? (
                                        <p className="text-2xl font-medium text-emerald-400">Crédito Disponível: R$ {Math.abs(balance).toLocaleString('pt-BR')}</p>
                                    ) : (
                                        <p className="text-2xl font-medium text-emerald-400">Conta em Dia</p>
                                    )}
                                </div>
                            </div>
                            
                            {isDebt && (
                                <button 
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="bg-sky-500 hover:bg-sky-400 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all w-full md:w-auto justify-center"
                                >
                                    <QrCode size={18} /> Pagar agora com Pix
                                </button>
                            )}
                        </div>
                    );
                 })()}
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                label={isClient ? "Investimento Total" : isEditor ? "Entregas Realizadas" : "Receita Prevista"} 
                value={isEditor ? myDelivered : `R$ ${totalRevenue.toLocaleString('pt-BR')}`} 
                icon={isEditor ? <CheckCircle2 /> : <DollarSign />} 
                color={isEditor ? "text-purple-400" : "text-emerald-400"} 
                tooltip={isClient ? "Total investido em projetos ativos." : isEditor ? "Total de entregas concluídas este mês." : "Soma do valor de todos os projetos ativos."}
              />
              <StatCard 
                label="Em Produção" 
                value={activeProjectsCount} 
                icon={<Zap />} 
                color="text-blue-400" 
                tooltip="Projetos em andamento."
                onClick={() => setView('projects')}
              />
              {!isClient && (
                <StatCard 
                  label="Parceiros" 
                  value={clients.length} 
                  icon={<Users />} 
                  color="text-indigo-400" 
                  tooltip="Base de clientes."
                  onClick={() => setView('clients')}
                />
              )}
               <StatCard 
                label={isClient ? "Aguardando Aprovação" : "Pendências"} 
                value={pendingDeliveriesCount} 
                icon={<Clock />} 
                color="text-orange-400" 
                tooltip="Projetos aguardando ação."
                onClick={() => setView('projects')}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
               <div className={`xl:col-span-${isClient ? '3' : '2'} space-y-6`}>
                  {isAdmin && (
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <Activity size={18} className="text-indigo-500" /> Sala de Edição
                        </h3>
                        <button onClick={() => setView('editors')} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                            Gerenciar
                        </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {editors.map(editor => {
                            const active = projects.filter(p => p.editorId === editor.id && ['ativo', 'em_revisao'].includes(p.status)).length;
                            return (
                                <div key={editor.id} className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl p-4 transition-all group">
                                    <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-300">
                                        {editor.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-xs">{editor.name}</h4>
                                        <p className="text-[10px] text-zinc-500">{active} Jobs Ativos</p>
                                    </div>
                                    </div>
                                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${active > 0 ? 'bg-indigo-500' : 'bg-zinc-600'} transition-all`} style={{ width: `${Math.min((active/5)*100, 100)}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    </div>
                  )}

                  <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white tracking-tight">{isEditor ? 'Meus Projetos Recentes' : 'Timeline Recente'}</h3>
                        <button onClick={() => setView('projects')} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-widest">Ver Todos</button>
                     </div>
                     <div className="space-y-1">
                        {filteredProjects.slice(0, 5).map(project => (
                           <div 
                              key={project.id} 
                              onClick={() => { setSelectedProjectId(project.id); setView('projects'); }}
                              className="grid grid-cols-12 items-center p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group border border-transparent hover:border-white/5"
                           >
                              <div className={`col-span-12 sm:col-span-5 md:col-span-${isEditor ? '6' : '4'} flex items-center gap-3 mb-2 sm:mb-0`}>
                                 <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 shrink-0">
                                    <Film size={14} />
                                 </div>
                                 <div className="min-w-0">
                                    <h4 className="font-medium text-white text-sm group-hover:text-indigo-300 transition-colors truncate">{project.name}</h4>
                                    <p className="text-[10px] text-zinc-500 hidden md:block truncate">{project.client}</p>
                                 </div>
                              </div>
                              <div className="col-span-6 sm:col-span-3 md:col-span-3">
                                 <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                                    <Calendar size={12} /> {project.deadline}
                                 </div>
                              </div>
                              {!isEditor && (
                                <div className="col-span-2 hidden md:block text-right pr-4">
                                    <span className="text-xs font-medium text-white">R$ {project.value}</span>
                                </div>
                              )}
                              <div className={`col-span-6 sm:col-span-4 md:col-span-${isEditor ? '3' : '3'} flex justify-end`}>
                                 <StatusBadge status={project.status} />
                              </div>
                           </div>
                        ))}
                        {filteredProjects.length === 0 && (
                            <div className="py-8 text-center text-zinc-500 text-sm">
                                Nenhum projeto encontrado.
                            </div>
                        )}
                     </div>
                  </div>
               </div>
               
               {!isClient && (
                 <div className="space-y-6">
                    <div className="h-[380px] w-full min-w-0">
                        <ProjectGoal 
                            currentCount={isEditor ? myDelivered : teamDelivered} 
                            targetCount={isEditor ? 15 : 45} // 45 Equipe, 15 Editor
                            role={isEditor ? 'editor' : 'admin'}
                        />
                    </div>

                    {isAdmin && (
                        <div className="h-[400px] w-full min-w-0">
                           <RevenueGoal currentRevenue={totalRevenue} />
                        </div>
                    )}
                 </div>
               )}
            </div>
          </div>
        );

      case 'financial':
        if (isClient) return <div className="p-8 text-center text-zinc-500">Acesso Restrito</div>;
        return (
            <div className="space-y-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/5 pb-8 gap-4">
               <div>
                 <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tighter mb-2">Financeiro</h2>
                 <p className="text-zinc-500 text-sm">Gestão completa de fluxo de caixa, despesas e lucros.</p>
               </div>
               <button 
                 onClick={() => setIsTransactionModalOpen(true)}
                 className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-white/5 w-full sm:w-auto justify-center"
               >
                 <Plus size={16} /> Nova Transação
               </button>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <StatCard label="Receita (Caixa)" value={`R$ ${totalIncome.toLocaleString('pt-BR')}`} icon={<Wallet />} color="text-emerald-400" />
               <StatCard label="Vendido (Projetos)" value={`R$ ${totalSales.toLocaleString('pt-BR')}`} icon={<ArrowUp />} color="text-indigo-400" />
                <StatCard label="A Receber (Dívida)" value={`R$ ${receivables.toLocaleString('pt-BR')}`} icon={<Clock />} color="text-orange-400" />
               <StatCard label="Despesas Totais" value={`R$ ${totalExpense.toLocaleString('pt-BR')}`} icon={<ArrowDown />} color="text-red-400" />
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 h-[400px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}><BarChart data={incomeByClientData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} /><XAxis type="number" stroke="#52525b" fontSize={12} /><YAxis dataKey="name" type="category" stroke="#52525b" fontSize={11} width={100} /><Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} /><Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} /></BarChart></ResponsiveContainer>
                </div>
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 h-[400px] min-w-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}><PieChart><Pie data={expensesByCategoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">{expensesByCategoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}</Pie><Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a' }} /></PieChart></ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6"><h3 className="font-bold text-white">Transações Recentes</h3></div>
                <div className="overflow-x-auto"><table className="w-full text-left text-sm text-zinc-400"><thead className="bg-white/[0.02] text-xs uppercase"><tr><th className="p-4 pl-6">Descrição</th><th className="p-4">Valor</th><th className="p-4 pr-6 text-right">Ações</th></tr></thead><tbody className="divide-y divide-white/5">{financialTransactions.map(t => (<tr key={t.id}><td className="p-4 pl-6">{t.description}</td><td className="p-4">R$ {t.amount}</td><td className="p-4 pr-6 text-right"><button onClick={() => handleDeleteTransaction(t.id)}><Trash2 size={16} /></button></td></tr>))}</tbody></table></div>
            </div>
            </div>
        );

      case 'clients':
        if (isClient) return <div className="p-8 text-center text-zinc-500">Acesso Restrito</div>;
        return (
          <div className="space-y-10 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/5 pb-8 gap-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tighter mb-2">Parceiros</h2>
                  <p className="text-zinc-500 text-sm">Gestão de relacionamento e produtoras.</p>
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => setIsClientModalOpen(true)}
                    className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-white/5 w-full sm:w-auto justify-center"
                  >
                    <Plus size={16} /> Novo Parceiro
                  </button>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {clients.map(client => {
                   const activeProjects = projects.filter(p => p.clientId === client.id && p.status !== 'arquivado' && p.status !== 'concluido');
                   const { totalProjectValue, totalPaid, balance } = getClientFinancialStatus(client.id);
                   const statusColor = balance > 0 ? 'text-orange-400' : 'text-emerald-400';
                   const statusText = balance > 0 ? 'Pendente' : 'Em Dia';

                   return (
                   <div key={client.id} className="group bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        {isAdmin && <button onClick={(e) => { e.stopPropagation(); setClientToDeleteId(client.id); setIsDeleteClientModalOpen(true);}} className="text-zinc-600 hover:text-red-500 bg-black/20 hover:bg-red-500/10 p-2 rounded-full transition-all"><Trash2 size={16}/></button>}
                      </div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-indigo-600 group-hover:border-indigo-500 transition-all shadow-lg">
                            <Building2 size={20} />
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border border-white/5 bg-zinc-900/50 ${statusColor}`}>
                            {statusText}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1 truncate">{client.company}</h3>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-6 truncate">{client.name}</p>

                      <div className="space-y-3 mb-6 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                         <div className="flex justify-between text-xs">
                            <span className="text-zinc-500">Projetos Ativos</span>
                            <span className="text-white font-bold">R$ {totalProjectValue}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                            <span className="text-zinc-500">Pago em Conta</span>
                            <span className="text-emerald-400 font-bold">R$ {totalPaid}</span>
                         </div>
                         <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full ${balance > 0 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: '100%' }} />
                         </div>
                         <div className="text-center text-[10px] uppercase font-bold text-zinc-500">
                            Saldo: <span className={balance > 0 ? 'text-orange-400' : 'text-emerald-400'}>{balance > 0 ? `Devedor R$ ${balance}` : `Crédito R$ ${Math.abs(balance)}`}</span>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${activeProjects.length > 0 ? 'text-indigo-400' : 'text-zinc-600'}`}>
                           {activeProjects.length > 0 ? `${activeProjects.length} Jobs Ativos` : 'Sem Jobs'}
                        </span>
                        <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:border-white/30 group-hover:text-white transition-all">
                           <ArrowUpRight size={12} />
                        </div>
                      </div>
                   </div>
                )})}
             </div>
          </div>
        );

      case 'projects':
      case 'editors':
      case 'cloud':
        if (view === 'projects') {
            const currentProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;
            if (currentProject) { 
               return (
               <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 md:p-8 animate-in slide-in-from-right-4 w-full relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
                 <div className="flex items-center justify-between mb-8 relative z-10">
                   <button onClick={() => setSelectedProjectId(null)} className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors"><ChevronRight className="rotate-180" size={16} /> Voltar</button>
                   {isAdmin && (<div className="flex gap-2"><button onClick={() => handleOpenEditProject(currentProject)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Editar Projeto"><Edit2 size={16} /></button>{currentProject.status !== 'arquivado' ? (<button onClick={() => handleArchiveProject(currentProject)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-yellow-400 transition-colors" title="Arquivar Projeto"><Archive size={16} /></button>) : (<span className="p-2 text-zinc-600 text-[10px] uppercase font-bold border border-zinc-800 rounded-lg">Arquivado</span>)}<button onClick={() => handleOpenDeleteProject(currentProject)} className="p-2 bg-white/5 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-500 transition-colors" title="Excluir Projeto"><Trash2 size={16} /></button></div>)}
                 </div>
                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12 relative z-10">
                    <div className="xl:col-span-2 space-y-8">
                       <div><div className="flex items-center gap-3 mb-4"><StatusBadge status={currentProject.status} /><span className="text-xs text-zinc-600 font-mono">#{currentProject.id}</span></div><h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight leading-tight mb-2">{currentProject.name}</h2><p className="text-lg md:text-xl text-zinc-400">{currentProject.client}</p></div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl"><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Deadline</p><div className="flex items-center gap-2 text-white font-medium"><Calendar size={18} className="text-indigo-400" />{currentProject.deadline}</div></div>{!isEditor && (<div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl"><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Budget</p><div className="flex items-center gap-2 text-white font-medium"><DollarSign size={18} className="text-emerald-400" />R$ {currentProject.value}</div></div>)}{!isClient && (<div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl"><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Editor</p><div className="flex items-center gap-2 text-white font-medium"><Users size={18} className="text-blue-400" /><select className="bg-transparent border-none focus:ring-0 text-white font-medium p-0 cursor-pointer appearance-none outline-none w-full" value={currentProject.editorId || ''} onChange={(e) => handleAssignEditor(currentProject.id, e.target.value)}><option value="" className="bg-zinc-900">Selecionar</option>{editors.map(e => (<option key={e.id} value={e.id} className="bg-zinc-900">{e.name}</option>))}</select></div></div>)}<div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl"><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Status</p><div className="flex items-center gap-2 text-white font-medium"><Activity size={18} className="text-blue-400" />{!isClient ? (<div className="relative w-full"><select className="bg-transparent border-none focus:ring-0 text-white font-medium p-0 cursor-pointer appearance-none outline-none w-full" value={currentProject.status} onChange={(e) => handleUpdateProjectStatus(currentProject.id, e.target.value)}><option value="ativo" className="bg-zinc-900">Em Produção</option><option value="em_revisao" className="bg-zinc-900">Em Revisão</option><option value="concluido" className="bg-zinc-900">Aprovação</option><option value="aprovado" className="bg-zinc-900">Finalizado</option><option value="arquivado" className="bg-zinc-900">Arquivado</option></select></div>) : (<span>{currentProject.status === 'ativo' ? 'Em Produção' : currentProject.status === 'em_revisao' ? 'Em Ajuste' : currentProject.status === 'concluido' ? 'Aguardando Aprovação' : 'Finalizado'}</span>)}</div></div></div>
                       {currentProject.alterations && currentProject.alterations.length > 0 && (<div className="bg-orange-500/5 border border-orange-500/20 p-6 rounded-2xl animate-in fade-in"><div className="flex items-center justify-between mb-4"><h4 className="text-orange-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} /> Ajustes Solicitados (IA)</h4><span className="text-[10px] text-zinc-500 font-bold uppercase">{currentProject.alterations.filter(i => i.completed).length} / {currentProject.alterations.length}</span></div><div className="space-y-2">{currentProject.alterations.map((item) => (<div key={item.id} onClick={() => handleToggleAlteration(currentProject.id, item.id)} className={`flex items-center gap-3 p-3 rounded-lg border transition-all group ${item.completed ? 'bg-orange-500/10 border-orange-500/20' : 'bg-zinc-900 border-zinc-800 hover:border-orange-500/30'} ${!isClient ? 'cursor-pointer' : 'cursor-default'}`}><div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${item.completed ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-600 bg-transparent group-hover:border-orange-400'}`}><CheckCircle2 size={12} className={item.completed ? 'opacity-100' : 'opacity-0'} /></div><span className={`text-sm ${item.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{item.task}</span></div>))}</div></div>)}
                       <div className="space-y-4 pt-4 border-t border-white/5"><h3 className="text-sm font-bold text-white uppercase tracking-widest">Briefing</h3><p className="text-zinc-400 text-sm leading-7">{currentProject.description || "Sem descrição disponível."}</p></div>
                       <div className="pt-6 border-t border-white/5"><div className="flex justify-between items-center mb-6"><h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Galeria de Entregas</h3>{!isClient && currentProject.status !== 'arquivado' && (<label className="cursor-pointer bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border border-white/5"><Upload size={12} /> Upload <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, currentProject.id)} /></label>)}</div><div className="mb-6 bg-zinc-900/50 p-4 rounded-xl border border-white/5"><div className="flex justify-between text-xs mb-2"><span className="font-bold text-zinc-400">Progresso</span><span className="font-bold text-white">{currentProject.deliveries?.length || 0} / {currentProject.expectedDeliveries || 1} Entregas</span></div><div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${Math.min(((currentProject.deliveries?.length || 0) / (currentProject.expectedDeliveries || 1)) * 100, 100)}%` }} /></div></div>{currentProject.deliveries && currentProject.deliveries.length > 0 ? (<div className="grid grid-cols-1 gap-3">{currentProject.deliveries.map(file => (<div key={file.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-[#121212] border border-white/5 rounded-xl hover:border-white/10 transition-colors group gap-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500"><FileVideo size={20} /></div><div><p className="text-sm font-medium text-white break-all">{file.name}</p><div className="flex items-center gap-2 text-[10px] text-zinc-500"><span>{file.size}</span><span>•</span><span>{new Date(file.uploadedAt).toLocaleDateString()}</span></div></div></div><div className="flex items-center gap-2 w-full sm:w-auto justify-end"><a href={file.url} download={file.name} className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-all" title="Baixar Arquivo"><Download size={14} /><span>Baixar</span></a>{!isClient && (<button onClick={() => handleDeleteDelivery(currentProject.id, file.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir Entrega"><Trash2 size={16} /></button>)}</div></div>))}</div>) : (<div className="text-center py-8 border border-dashed border-white/10 rounded-xl"><p className="text-zinc-500 text-xs">Nenhum arquivo entregue ainda.</p></div>)}</div>
                    </div>
                    <div className="space-y-6"><div className="bg-[#121212] border border-white/5 rounded-xl p-6"><h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2"><CheckSquare size={14} /> Checklist de Entrega</h3><div className="space-y-1">{(currentProject.deliveryChecklist || defaultChecklist).map((item) => (<div key={item.id} onClick={() => handleToggleChecklist(currentProject.id, item.id)} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isClient ? 'cursor-default' : 'hover:bg-white/5 cursor-pointer group'}`}><div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-700 bg-transparent'}`}><CheckCircle2 size={10} className={item.completed ? 'opacity-100' : 'opacity-0'} /></div><span className={`text-sm transition-all ${item.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{item.label}</span>{isClient && <Lock size={10} className="ml-auto text-zinc-700" />}</div>))}</div></div>{isClient && currentProject.status !== 'arquivado' && (<div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6 animate-in slide-in-from-bottom-4"><h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">Ações do Cliente</h3><div className="grid grid-cols-1 gap-3"><button onClick={() => setIsAlterationModalOpen(true)} className="w-full py-3 rounded-xl border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors"><MessageSquareWarning size={16} /> Solicitar Alteração</button><button onClick={() => handleClientApprove(currentProject.id)} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"><ThumbsUp size={16} /> Aprovar Entrega</button></div><p className="text-[10px] text-zinc-500 mt-4 text-center leading-relaxed">Ao aprovar, o projeto será marcado como finalizado e contabilizado na meta do editor.</p></div>)}</div>
                 </div>
               </div>
            ); }
            
            return (
                <div className="space-y-6 w-full max-w-[1600px] mx-auto animate-in fade-in h-full flex flex-col">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-white/5 pb-8 flex-shrink-0 gap-4"><div><h2 className="text-3xl md:text-4xl font-medium text-white tracking-tighter mb-2">Projetos</h2><p className="text-zinc-500 text-sm">{isClient ? 'Acompanhe o status e aprove entregas.' : 'Workflow e acompanhamento de entregas.'}</p></div>{!selectedProjectId && !isClient && (<div className="flex flex-col items-end gap-3 w-full md:w-auto"><div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-white/10 gap-1 overflow-x-auto max-w-full w-full md:w-auto">{[{ id: 'all', label: 'Todos' }, { id: 'ativo', label: 'Em Produção' }, { id: 'em_revisao', label: 'Revisão' }, { id: 'concluido', label: 'Aprovação' }, { id: 'aprovado', label: 'Finalizados' }, { id: 'arquivado', label: 'Arquivados' }].map((tab) => {const isActive = statusFilter === tab.id;return (<button key={tab.id} onClick={() => setStatusFilter(tab.id)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${isActive ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>{tab.label}</button>);})}</div><div className="flex gap-2 w-full md:w-auto justify-end"><button onClick={() => setIsProjectModalOpen(true)} className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg w-full md:w-auto justify-center"><Plus size={14} /> Novo Job</button></div></div>)}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">{filteredProjects.map(project => {const clientFin = project.clientId ? getClientFinancialStatus(project.clientId) : { balance: 0 };const isFinanciallyCovered = clientFin.balance <= 0; return (<div key={project.id} className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden flex flex-col h-[280px]"><div className="flex justify-between items-start mb-6"><div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors"><Film size={18} /></div><div className="flex flex-col items-end gap-1"><StatusBadge status={project.status} />{!isClient && (<span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${isFinanciallyCovered ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{isFinanciallyCovered ? 'Pago' : 'Pendente'}</span>)}</div></div><div className="mb-4"><h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">{project.name}</h3><p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{project.client}</p></div><div className="flex items-center gap-4 text-xs text-zinc-400 mt-auto pt-6 border-t border-white/5"><div className="flex items-center gap-1.5"><Calendar size={14} /> {project.deadline}</div>{!isEditor && (<div className="ml-auto flex items-center gap-1.5 text-white font-medium">R$ {project.value}</div>)}</div><button onClick={() => setSelectedProjectId(project.id)} className="absolute inset-0 z-10" /></div>)})}</div>
                </div>
            );
        }
        if (view === 'editors') {
            if (isClient) return <div className="p-8 text-center text-zinc-500">Acesso Restrito</div>;
            return (
               <div className="space-y-10 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/5 pb-8 gap-4">
                    <div><h2 className="text-3xl md:text-4xl font-medium text-white tracking-tighter mb-2">Editores</h2><p className="text-zinc-500 text-sm">Gestão de performance e equipe.</p></div>
                    {isAdmin && !selectedEditorId && (<button onClick={() => setIsEditorModalOpen(true)} className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-white/5 w-full sm:w-auto justify-center"><Plus size={16} /> Adicionar</button>)}
                 </div>
                 {selectedEditorId ? (
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 md:p-8 animate-in slide-in-from-right-4 w-full">
                       <div className="flex justify-between items-start mb-10"><div className="flex flex-col sm:flex-row items-start sm:items-center gap-6"><button onClick={() => setSelectedEditorId(null)} className="bg-white/5 hover:bg-white/10 p-3 rounded-xl text-zinc-400 hover:text-white transition-colors"><ChevronRight className="rotate-180" size={20} /></button><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-2xl font-black text-white shadow-2xl">{editors.find(e => e.id === selectedEditorId)?.name.slice(0,2).toUpperCase()}</div><div><h2 className="text-2xl md:text-3xl font-medium text-white">{editors.find(e => e.id === selectedEditorId)?.name}</h2><p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{editors.find(e => e.id === selectedEditorId)?.email}</p></div></div></div></div>
                       <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Jobs Ativos</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{projects.filter(p => p.editorId === selectedEditorId).map(project => (<div key={project.id} onClick={() => { setSelectedProjectId(project.id); setView('projects'); }} className="bg-zinc-900/50 p-5 rounded-xl border border-white/5 hover:border-indigo-500/50 cursor-pointer transition-all group"><div className="flex justify-between items-start mb-4"><StatusBadge status={project.status} /></div><h4 className="font-medium text-white mb-1 group-hover:text-indigo-300 transition-colors">{project.name}</h4><div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-zinc-400"><Clock size={14} /> {project.deadline}</div></div>))}</div>
                    </div>
                 ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{editors.map(editor => { 
                       const activeProjects = projects.filter(p => p.editorId === editor.id && p.status !== 'arquivado' && p.status !== 'concluido' && p.status !== 'aprovado'); 
                       const deliveredCount = projects.filter(p => p.editorId === editor.id && p.status === 'aprovado').length;

                       return (
                       <div key={editor.id} onClick={() => setSelectedEditorId(editor.id)} className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8 hover:border-white/20 transition-all group flex flex-col cursor-pointer relative">
                           <div className="flex justify-between items-start mb-6">
                               <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-xl font-bold text-zinc-400">{editor.name.slice(0, 2)}</div>
                               {activeProjects.length > 0 && (<span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>)}
                           </div>
                           <div className="mb-8">
                               <h3 className="text-xl font-bold text-white">{editor.name}</h3>
                               <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{editor.email}</p>
                           </div>
                           <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                               <span className="text-xs text-zinc-400">{activeProjects.length} ativos</span>
                               <span className="text-xs text-emerald-400 font-bold">{deliveredCount} entregues</span>
                           </div>
                       </div>
                   ); })}</div>
                 )}
               </div>
            );
        }
        if (view === 'cloud') {
            const cloudProjects = projects.filter(p => {
                if (isAdmin) return true;
                if (isClient) return p.clientId === session.user.id;
                if (isEditor) return p.editorId === session.user.id;
                return false;
            });

            const getMonthName = (dateStr: string) => { const date = new Date(dateStr); const userTimezoneOffset = date.getTimezoneOffset() * 60000; const correctedDate = new Date(date.getTime() + userTimezoneOffset); return correctedDate.toLocaleString('pt-BR', { month: 'long' }); };
            const getYear = (dateStr: string) => dateStr.split('-')[0];
            const effectivePath = isClient ? [session.user.company || session.user.name, ...cloudPath] : cloudPath;
            const currentDepth = effectivePath.length;
            const filteredContext = cloudProjects.filter(p => {
                if (currentDepth > 0 && p.client !== effectivePath[0]) return false; 
                if (currentDepth > 1 && getYear(p.deadline) !== effectivePath[1]) return false;
                if (currentDepth > 2 && getMonthName(p.deadline) !== effectivePath[2]) return false;
                if (currentDepth > 3 && p.id !== effectivePath[3]) return false;
                return true;
            });
            const renderCloudContent = () => {
                if (currentDepth === 0) { const uniqueClients = Array.from(new Set(filteredContext.map(p => p.client))); if (uniqueClients.length === 0) return <div className="text-zinc-500 text-sm">Nenhuma pasta encontrada.</div>; return (<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{uniqueClients.map(clientName => (<div key={clientName} onClick={() => setCloudPath([...cloudPath, clientName])} className="group p-4 bg-[#121212] border border-white/5 rounded-xl hover:bg-white/5 cursor-pointer transition-all flex flex-col items-center gap-3 text-center"><div className="w-16 h-12 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors"><Folder size={28} fill="currentColor" fillOpacity={0.2} /></div><span className="text-xs font-bold text-zinc-300 group-hover:text-white truncate w-full">{clientName}</span></div>))}</div>); }
                if (currentDepth === 1) { const uniqueYears = Array.from(new Set(filteredContext.map(p => getYear(p.deadline)))).sort().reverse(); return (<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{uniqueYears.map(year => (<div key={year} onClick={() => setCloudPath([...cloudPath, year])} className="group p-4 bg-[#121212] border border-white/5 rounded-xl hover:bg-white/5 cursor-pointer transition-all flex flex-col items-center gap-3 text-center"><div className="w-16 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors"><Folder size={28} fill="currentColor" fillOpacity={0.2} /></div><span className="text-xs font-bold text-zinc-300 group-hover:text-white truncate w-full">{year}</span></div>))}</div>); }
                if (currentDepth === 2) { const uniqueMonths = Array.from(new Set(filteredContext.map(p => getMonthName(p.deadline)))); return (<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{uniqueMonths.map(month => (<div key={month} onClick={() => setCloudPath([...cloudPath, month])} className="group p-4 bg-[#121212] border border-white/5 rounded-xl hover:bg-white/5 cursor-pointer transition-all flex flex-col items-center gap-3 text-center"><div className="w-16 h-12 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Folder size={28} fill="currentColor" fillOpacity={0.2} /></div><span className="text-xs font-bold text-zinc-300 group-hover:text-white truncate w-full capitalize">{month}</span></div>))}</div>); }
                if (currentDepth === 3) { return (<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{filteredContext.map(project => (<div key={project.id} onClick={() => setCloudPath([...cloudPath, project.id])} className="group p-4 bg-[#121212] border border-white/5 rounded-xl hover:bg-white/5 cursor-pointer transition-all flex flex-col items-center gap-3 text-center"><div className="w-16 h-12 bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors relative"><Folder size={28} fill="currentColor" fillOpacity={0.2} /><span className="absolute -top-1 -right-1 bg-zinc-900 text-[9px] text-white px-1.5 py-0.5 rounded-full border border-white/10">{project.deliveries?.length || 0}</span></div><span className="text-xs font-bold text-zinc-300 group-hover:text-white truncate w-full line-clamp-2">{project.name}</span></div>))}</div>); }
                if (currentDepth === 4) { const projectId = effectivePath[3]; const project = projects.find(p => p.id === projectId); const files = project?.deliveries || []; if (files.length === 0) return (<div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-white/10 rounded-2xl"><Folder size={48} className="mb-4 opacity-20" /><p className="text-sm font-bold">Pasta Vazia</p><p className="text-xs">Nenhum upload realizado neste projeto ainda.</p></div>); return (<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">{files.map(file => (<div key={file.id} className="group relative bg-[#121212] border border-white/5 rounded-xl p-4 hover:border-white/20 transition-all flex items-start gap-4"><div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500 shrink-0"><File size={20} /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-white truncate mb-1" title={file.name}>{file.name}</p><div className="flex items-center gap-2 text-[10px] text-zinc-500"><span>{file.size}</span><span>•</span><span>{new Date(file.uploadedAt).toLocaleDateString()}</span></div></div><a href={file.url} download className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-indigo-400 transition-colors"><Download size={16} /></a></div>))}</div>); }
            };
            return (
                <div className="space-y-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500 h-full flex flex-col">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 gap-4 flex-shrink-0"><div><h2 className="text-3xl md:text-4xl font-medium text-white tracking-tighter mb-2">Arquivos</h2><p className="text-zinc-500 text-sm">Gestão de assets e entregáveis na nuvem.</p></div></header>
                    <div className="flex-1 flex flex-col bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="bg-zinc-900/50 border-b border-white/5 p-4 flex items-center gap-2 overflow-x-auto scrollbar-hide"><button onClick={() => setCloudPath([])} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${cloudPath.length === 0 ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}><Home size={14} /> Início</button>{cloudPath.map((item, index) => { let label = item; if (index === 3 && item.startsWith('p')) { const p = projects.find(proj => proj.id === item); if (p) label = p.name; } return (<React.Fragment key={index}><ChevronRight size={14} className="text-zinc-700" /><button onClick={() => setCloudPath(cloudPath.slice(0, index + 1))} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${index === cloudPath.length - 1 ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>{label}</button></React.Fragment>); })}</div>
                        <div className="p-6 flex-1 overflow-y-auto">{cloudPath.length > 0 && (<button onClick={() => setCloudPath(cloudPath.slice(0, -1))} className="mb-6 flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"><CornerUpLeft size={16} /> Voltar</button>)}{renderCloudContent()}</div>
                    </div>
                </div>
            );
        }

      case 'editing_room':
        return (
            <div className="space-y-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-500 h-full flex flex-col">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-8 gap-4 flex-shrink-0">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tighter mb-2 flex items-center gap-3">
                            <Clapperboard size={36} className="text-indigo-500" /> Sala de Edição
                        </h2>
                        <p className="text-zinc-500 text-sm">Use a IA para roteirizar, corrigir e criar.</p>
                    </div>
                    {selectedGem && (
                        <button 
                            onClick={() => { setSelectedGem(null); setGemOutput(''); setGemInput(''); setAttachedFiles([]); }}
                            className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors"
                        >
                            <ChevronRight className="rotate-180" size={16} /> Voltar aos Gems
                        </button>
                    )}
                </header>

                <div className="flex-1 flex flex-col min-h-0">
                    {!selectedGem ? (
                        // GEM GRID SELECTION
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2">
                            {gems.map(gem => (
                                <div 
                                    key={gem.id} 
                                    onClick={() => setSelectedGem(gem)}
                                    className="group relative bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${gem.color} opacity-5 group-hover:opacity-10 rounded-bl-full transition-opacity`} />
                                    
                                    <div className="flex justify-between items-start">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg ${gem.color} bg-opacity-80`}>
                                            {React.cloneElement(gem.icon as React.ReactElement<any>, { size: 24 })}
                                        </div>
                                        <button 
                                            onClick={(e) => handleOpenGemConfig(gem, e)}
                                            className="text-zinc-600 hover:text-white transition-colors p-2 z-10"
                                            title="Configurar Prompt"
                                        >
                                            <Settings size={16} />
                                        </button>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{gem.title}</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed mb-6 line-clamp-3">{gem.description}</p>
                                    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                        <PlayCircle size={32} className="text-white/20 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        // GEM INTERFACE (CHAT/INPUT)
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-0">
                            {/* Input Area */}
                            <div className="flex flex-col h-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${selectedGem.color}`}>
                                            {React.cloneElement(selectedGem.icon as React.ReactElement<any>, { size: 20 })}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{selectedGem.title}</h3>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Input de Contexto</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => handleOpenGemConfig(selectedGem, e)}
                                        className="text-zinc-600 hover:text-white transition-colors p-2"
                                        title="Configurar Prompt"
                                    >
                                        <Settings size={16} />
                                    </button>
                                </div>
                                
                                {/* Attached Files Display */}
                                {attachedFiles.length > 0 && (
                                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                                        {attachedFiles.map((file, idx) => (
                                            <div key={idx} className="relative group bg-zinc-900 border border-white/10 rounded-lg p-2 flex items-center gap-2 min-w-[120px]">
                                                <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-zinc-400">
                                                    <FileText size={14} />
                                                </div>
                                                <span className="text-[10px] text-zinc-300 truncate w-20">{file.name}</span>
                                                <button 
                                                    onClick={() => removeAttachedFile(idx)}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="relative flex-1 bg-zinc-900/50 border border-white/5 rounded-xl flex flex-col">
                                    <textarea 
                                        value={gemInput}
                                        onChange={(e) => setGemInput(e.target.value)}
                                        className="flex-1 bg-transparent border-none p-4 text-white placeholder-zinc-600 focus:ring-0 resize-none text-sm leading-relaxed"
                                        placeholder="Descreva o que você precisa... (Use o clipe para anexar PDFs, Imagens ou Textos)"
                                    />
                                    
                                    <div className="p-3 flex justify-between items-center border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="file" 
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleGemFileSelect}
                                                accept=".pdf,.txt,.md,.csv,image/*" 
                                            />
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                                                title="Anexar arquivo"
                                            >
                                                <Paperclip size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button 
                                        onClick={handleRunGem}
                                        disabled={(!gemInput.trim() && attachedFiles.length === 0) || isGemLoading}
                                        className="bg-white text-black hover:bg-zinc-200 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGemLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                        {isGemLoading ? 'Processando...' : 'Executar Gem'}
                                    </button>
                                </div>
                            </div>

                            {/* Output Area */}
                            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 overflow-y-auto relative h-full">
                                {isGemLoading ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles size={16} className="text-indigo-500" />
                                            </div>
                                        </div>
                                        <p className="text-xs uppercase tracking-widest animate-pulse">Consultando a IA...</p>
                                    </div>
                                ) : gemOutput ? (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#121212]/95 backdrop-blur py-2 border-b border-white/5">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Resultado</span>
                                            <button 
                                                onClick={() => copyToClipboard(gemOutput)}
                                                className="text-zinc-500 hover:text-white transition-colors"
                                                title="Copiar"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                        <div className="whitespace-pre-wrap text-zinc-300 leading-relaxed">
                                            {gemOutput}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl">
                                        <Wand2 size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm font-bold">Aguardando Input</p>
                                        <p className="text-xs">O resultado aparecerá aqui.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );

      default:
        return <div className="flex items-center justify-center h-full text-zinc-500"><p className="text-xs font-bold uppercase tracking-widest">Em construção: {view}</p></div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none"><div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" /><div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-900/5 rounded-full blur-[100px]" /></div>
      <Sidebar currentView={view} setView={setView} user={session.user} onLogout={handleLogout} />
      <main className="flex-1 ml-20 lg:ml-64 p-4 md:p-8 relative z-10 transition-all duration-300 w-full">
        {renderContent()}

        {/* --- MODAL DE CONFIGURAÇÃO DE GEM --- */}
        {isGemConfigModalOpen && (
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-2xl rounded-2xl p-8 relative animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <Settings size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Configurar Prompt do Gem</h3>
                                <p className="text-zinc-500 text-xs">Defina como a IA deve se comportar.</p>
                            </div>
                        </div>
                        <button onClick={() => setIsGemConfigModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col min-h-0">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Instrução do Sistema (Prompt)</label>
                        <textarea 
                            value={tempPrompt}
                            onChange={(e) => setTempPrompt(e.target.value)}
                            className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white font-mono text-sm leading-relaxed focus:outline-none focus:border-indigo-500/50 resize-none mb-6"
                            placeholder="Você é um especialista em..."
                        />
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setIsGemConfigModalOpen(false)}
                                className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-xs uppercase hover:bg-white/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveGemConfig}
                                className="px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs uppercase transition-colors flex items-center gap-2"
                            >
                                <Save size={16} /> Salvar Configuração
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Payment Modal */}
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
             <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-2xl p-0 relative animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-[#009EE3] p-6 text-center relative overflow-hidden"><button onClick={() => setIsPaymentModalOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-20"><X size={20} /></button><div className="flex flex-col items-center gap-2 relative z-10"><div className="p-3 bg-white rounded-full shadow-lg"><QrCode size={24} className="text-[#009EE3]" /></div><h3 className="text-lg font-bold text-white tracking-tight">Pagamento Pix</h3><p className="text-[10px] font-medium text-white/80 uppercase tracking-widest">Instantâneo</p></div><div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" /></div>
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-zinc-500 text-xs mb-1">Valor Total a Pagar</p>
                        <p className="text-3xl font-bold text-white tracking-tighter">{(() => { const { balance } = getClientFinancialStatus(session.user.id); return `R$ ${balance.toLocaleString('pt-BR')}`; })()}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl flex items-center justify-center min-h-[160px] relative">
                        {isGeneratingPix ? (
                             <div className="flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-zinc-400" size={32} />
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Gerando QR Code...</span>
                             </div>
                        ) : pixData ? (
                             <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=svg&data=${encodeURIComponent(pixData.point_of_interaction.transaction_data.qr_code)}`} 
                                alt="QR Code Pix" 
                                className="w-40 h-40 mix-blend-multiply opacity-90 animate-in zoom-in" 
                             />
                        ) : (
                             <div className="flex flex-col items-center gap-2 text-center">
                                 <AlertTriangle className="text-red-400" size={24} />
                                 <span className="text-[10px] text-zinc-500">Erro ao gerar Pix.<br/>Tente novamente.</span>
                                 <button onClick={handleGeneratePix} className="text-xs font-bold text-[#009EE3] hover:underline flex items-center gap-1 mt-1"><RefreshCw size={10} /> Recarregar</button>
                             </div>
                        )}
                    </div>

                    {pixData && (
                        <div className="space-y-2 animate-in slide-in-from-bottom-2">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Pix Copia e Cola</p>
                            <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl p-3">
                                <p className="text-[10px] text-zinc-400 font-mono truncate flex-1 select-all">{pixData.point_of_interaction.transaction_data.qr_code}</p>
                                <button onClick={() => { copyToClipboard(pixData.point_of_interaction.transaction_data.qr_code); }} className="text-indigo-400 hover:text-white transition-colors"><Copy size={16} /></button>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                        <Smartphone size={16} className="text-blue-400 mt-0.5" />
                        <p className="text-[10px] text-zinc-400 leading-relaxed">Abra o app do seu banco, escolha <strong>Pix</strong> e escaneie o código acima ou cole a chave. O pagamento é processado instantaneamente.</p>
                    </div>
                </div>
             </div>
          </div>
        )}

        {isCredentialsModalOpen && isAdmin && (<div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300"><div className="bg-[#0A0A0A] border border-white/10 w-full max-w-4xl rounded-2xl p-8 relative animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col max-h-[90vh]"><div className="flex justify-between items-center mb-6"><div><h3 className="text-2xl font-medium text-white tracking-tight flex items-center gap-3"><Key size={24} className="text-indigo-500" /> Gestão de Acessos</h3><p className="text-zinc-500 text-xs mt-1">Visualize e gerencie as credenciais de todos os usuários.</p></div><button onClick={() => setIsCredentialsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={24} /></button></div><div className="overflow-y-auto pr-2 scrollbar-hide"><div className="space-y-8"><div><h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Administradores</h4><div className="bg-zinc-900/30 rounded-xl border border-white/5 p-4 flex flex-col md:flex-row justify-between items-center gap-4"><div className="flex items-center gap-4 w-full md:w-auto"><div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">{session.user.name.charAt(0)}</div><div><p className="text-sm font-bold text-white">{session.user.name}</p><p className="text-[10px] text-zinc-500 uppercase tracking-wide">Master Admin</p></div></div><div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5 w-full md:w-auto flex-1 justify-between md:justify-end"><div className="text-xs font-mono text-zinc-300 px-2 truncate">{session.user.email}</div><button onClick={() => copyToClipboard(session.user.email)} className="text-zinc-500 hover:text-indigo-400 transition-colors"><Copy size={14} /></button></div><div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5 w-full md:w-auto"><div className="text-xs font-mono text-zinc-300 px-2 w-32 truncate">{revealedPasswords[session.user.id] ? getMockPassword(session.user) : '••••••••'}</div><button onClick={() => togglePasswordVisibility(session.user.id)} className="text-zinc-500 hover:text-white transition-colors">{revealedPasswords[session.user.id] ? <EyeOff size={14} /> : <Eye size={14} />}</button><button onClick={() => copyToClipboard(getMockPassword(session.user))} className="text-zinc-500 hover:text-indigo-400 transition-colors ml-1"><Copy size={14} /></button></div></div></div></div></div></div></div>)}
        {isTransactionModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-2xl p-8 relative animate-in zoom-in-95 duration-300 shadow-2xl mx-4 overflow-y-auto max-h-[90vh]">
               <button onClick={() => setIsTransactionModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
                 <X size={20} />
               </button>
               <h3 className="text-2xl font-medium text-white mb-6 tracking-tight">Nova Transação</h3>
               <form onSubmit={handleAddTransaction} className="space-y-5">
                  <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl mb-4">
                     <button
                        type="button" 
                        onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${newTransaction.type === 'income' ? 'bg-emerald-500 text-white' : 'text-zinc-500 hover:text-white'}`}
                     >
                        Receita
                     </button>
                     <button
                        type="button" 
                        onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${newTransaction.type === 'expense' ? 'bg-red-500 text-white' : 'text-zinc-500 hover:text-white'}`}
                     >
                        Despesa
                     </button>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Descrição</label><input value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required placeholder={newTransaction.type === 'income' ? "Ex: Retainer Mensal" : "Ex: Freelancer Motion"} /></div>
                  <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Valor (R$)</label><input type="number" value={newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value)})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required /></div><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Data</label><input type="date" value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none" required /></div></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{newTransaction.type === 'income' ? 'Parceiro / Produtora' : 'Categoria'}</label>{newTransaction.type === 'income' ? (<div className="space-y-3"><select value={newTransaction.clientId || ''} onChange={e => setNewTransaction({...newTransaction, clientId: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"><option value="" className="bg-zinc-900">Selecione a Produtora...</option>{clients.map(client => (<option key={client.id} value={client.id} className="bg-zinc-900">{client.company}</option>))}<option value="" className="bg-zinc-900">Outros (Venda Avulsa)</option></select>{newTransaction.clientId && (<div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"><div className="flex items-center gap-2 mb-1"><CreditCard size={14} className="text-indigo-400" /><span className="text-xs font-bold text-indigo-300">Abatimento Automático</span></div><p className="text-[10px] text-zinc-400 leading-relaxed">O valor será descontado do saldo devedor de projetos deste cliente (Conta Corrente).</p>{(() => { const { balance } = getClientFinancialStatus(newTransaction.clientId); return (<div className="mt-2 pt-2 border-t border-indigo-500/20 flex justify-between text-[10px]"><span className="text-zinc-500">Saldo Atual (Devendo):</span><span className="text-white font-bold">R$ {balance}</span></div>) })()}</div>)}</div>) : (<select value={newTransaction.category} onChange={e => setNewTransaction({...newTransaction, category: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"><option value="Editores" className="bg-zinc-900">Editores</option><option value="Projetos" className="bg-zinc-900">Custo de Projeto</option><option value="Software" className="bg-zinc-900">Software (Adobe, Cloud)</option><option value="Equipamento" className="bg-zinc-900">Equipamento</option><option value="Impostos" className="bg-zinc-900">Impostos</option><option value="Outros" className="bg-zinc-900">Outros</option></select>)}</div>
                  <div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded-xl border border-white/5"><div className="flex items-center h-5"><input id="isRecurring" type="checkbox" checked={newTransaction.isRecurring} onChange={(e) => setNewTransaction({...newTransaction, isRecurring: e.target.checked})} className="w-4 h-4 text-indigo-600 bg-zinc-800 border-zinc-600 rounded focus:ring-indigo-500 focus:ring-2" /></div><div className="ml-2 text-sm"><label htmlFor="isRecurring" className="font-medium text-white">Transação Recorrente</label><p className="text-xs text-zinc-500">Repetir este lançamento mensalmente.</p></div></div>
                  <button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 rounded-xl mt-4 uppercase tracking-widest transition-all">Salvar Lançamento</button>
               </form>
            </div>
          </div>
        )}
        
        {isAlterationModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-2xl p-6 relative animate-in zoom-in-95 duration-300 shadow-2xl mx-4">
                    <button onClick={() => { setIsAlterationModalOpen(false); setAlterationAudio(null); setAlterationText(''); setIsRecording(false); }} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 border border-orange-500/20">{isGeneratingAI ? <Sparkles className="animate-spin" size={20} /> : <MessageSquareWarning size={20} />}</div>
                        <h3 className="text-xl font-bold text-white">Solicitar Alteração</h3>
                    </div>
                    <p className="text-sm text-zinc-500 mb-6 leading-relaxed">Descreva ou fale o que precisa ser ajustado. A IA organizará sua solicitação em tarefas para o editor.</p>
                    
                    <textarea 
                        value={alterationText} 
                        onChange={(e) => setAlterationText(e.target.value)} 
                        disabled={isGeneratingAI || isRecording} 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 transition-colors min-h-[120px] resize-none mb-4 disabled:opacity-50" 
                        placeholder="Escreva ou grave um áudio..." 
                    />

                    {alterationAudio && !isRecording && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-4 flex items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                    <Mic size={16} />
                                </div>
                                <span className="text-xs text-white font-medium truncate max-w-[180px]">{alterationAudio.name}</span>
                            </div>
                            <button onClick={() => setAlterationAudio(null)} className="text-zinc-500 hover:text-red-500 p-1"><X size={14} /></button>
                        </div>
                    )}
                    
                    <div className="flex gap-3">
                       {!isRecording ? (
                            <button 
                                onClick={handleStartRecording}
                                disabled={isGeneratingAI || !!alterationAudio} 
                                className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${!!alterationAudio ? 'border-zinc-800 text-zinc-600 cursor-not-allowed' : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'}`}
                                title="Gravar Áudio"
                            >
                                <Mic size={18} />
                            </button>
                        ) : (
                            <button 
                                onClick={handleStopRecording}
                                className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse flex items-center justify-center hover:bg-red-500/20 transition-colors"
                                title="Parar Gravação"
                            >
                                <Square size={18} fill="currentColor" />
                            </button>
                        )}

                        <button 
                            onClick={handleSubmitAlteration} 
                            disabled={(!alterationText.trim() && !alterationAudio) || isGeneratingAI || isRecording} 
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white font-bold text-xs uppercase transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                        >
                            {isGeneratingAI ? (<><Loader2 size={14} className="animate-spin" /> Processando IA...</>) : (<><Sparkles size={14} /> Enviar com IA</>)}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* ... Rest of modals (Client, Editor, Project, etc) are unchanged ... */}
        {isClientModalOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300"><div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-2xl p-8 relative animate-in zoom-in-95 duration-300 shadow-2xl mx-4 overflow-y-auto max-h-[90vh]"><button onClick={() => setIsClientModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X size={20} /></button><h3 className="text-2xl font-medium text-white mb-6 tracking-tight">Novo Parceiro</h3><form onSubmit={handleAddClient} className="space-y-5"><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome do Responsável</label><input value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required placeholder="Ex: Gabriel" /></div><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Empresa</label><input value={newClient.company} onChange={e => setNewClient({...newClient, company: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required placeholder="Ex: Imperial Drones" /></div><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Corporativo</label><input type="email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required placeholder="nome+@empresa.com" /><p className="text-[9px] text-zinc-600 mt-1">*Será usado para login</p></div><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Telefone</label><input value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required /></div><button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 rounded-xl mt-4 uppercase tracking-widest transition-all">Cadastrar</button></form></div></div>)}
        {isDeleteClientModalOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300"><div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-2xl p-6 relative animate-in zoom-in-95 duration-300 shadow-2xl text-center mx-4"><div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 border border-red-500/20"><AlertTriangle size={20} /></div><h3 className="text-xl font-bold text-white mb-2">Remover Parceiro?</h3><p className="text-sm text-zinc-500 mb-6">Esta ação removerá o acesso do cliente à plataforma permanentemente.</p><div className="flex gap-3"><button onClick={() => { setIsDeleteClientModalOpen(false); setClientToDeleteId(null); }} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold text-xs uppercase hover:bg-white/5 transition-colors">Cancelar</button><button onClick={handleDeleteClient} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase transition-colors shadow-lg shadow-red-500/20">Confirmar</button></div></div></div>)}
        {isEditorModalOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300"><div className="bg-[#0A0A0A] border border-white/10 w-full max-w-md rounded-2xl p-8 relative animate-in zoom-in-95 duration-300 shadow-2xl mx-4 overflow-y-auto max-h-[90vh]"><button onClick={() => setIsEditorModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X size={20} /></button><h3 className="text-2xl font-medium text-white mb-6 tracking-tight">Novo Editor</h3><form onSubmit={handleAddEditor} className="space-y-5"><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome Completo</label><input value={newEditor.name} onChange={e => setNewEditor({...newEditor, name: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required /></div><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Email de Acesso</label><input type="email" value={newEditor.email} onChange={e => setNewEditor({...newEditor, email: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required /></div><button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 rounded-xl mt-4 uppercase tracking-widest transition-all">Adicionar</button></form></div></div>)}
        {isProjectModalOpen && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300"><div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-2xl p-8 relative animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide mx-4"><button onClick={() => setIsProjectModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X size={20} /></button><h3 className="text-2xl font-medium text-white mb-2 tracking-tight">Criar Novo Job</h3><p className="text-zinc-500 text-xs mb-8">Defina os detalhes e atribua a equipe responsável.</p><form onSubmit={handleAddProject} className="space-y-5"><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome do Projeto</label><input value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required placeholder="Ex: Campanha de Verão" /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Cliente / Parceiro</label><div className="relative"><select value={newProject.clientId} onChange={e => setNewProject({...newProject, clientId: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer" required><option value="" className="bg-zinc-900 text-zinc-500">Selecione...</option>{clients.map(c => (<option key={c.id} value={c.id} className="bg-zinc-900 text-white">{c.company}</option>))}</select><ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-zinc-500 pointer-events-none" size={16} /></div></div><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Editor Responsável</label><div className="relative"><select value={newProject.editorId} onChange={e => setNewProject({...newProject, editorId: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer" required><option value="" className="bg-zinc-900 text-zinc-500">Selecione...</option>{editors.map(e => (<option key={e.id} value={e.id} className="bg-zinc-900 text-white">{e.name}</option>))}</select><ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-zinc-500 pointer-events-none" size={16} /></div></div></div><div className="grid grid-cols-2 gap-4">{!isEditor && (<div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Valor (R$)</label><input type="number" value={newProject.value} onChange={e => setNewProject({...newProject, value: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required placeholder="0.00" /></div>)}<div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Deadline</label><input type="date" value={newProject.deadline} onChange={e => setNewProject({...newProject, deadline: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none" required /></div></div><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Qtd. Entregas Previstas</label><input type="number" min="1" value={newProject.expectedDeliveries} onChange={e => setNewProject({...newProject, expectedDeliveries: parseInt(e.target.value) || 1})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required /></div><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Briefing / Descrição</label><textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none" placeholder="Detalhes essenciais do projeto..." /></div><button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 rounded-xl mt-4 uppercase tracking-widest transition-all">Criar Projeto</button></form></div></div>)}
        {isEditProjectModalOpen && editingProject && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300"><div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-2xl p-8 relative animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide mx-4"><button onClick={() => setIsEditProjectModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"><X size={20} /></button><h3 className="text-2xl font-medium text-white mb-2 tracking-tight">Editar Projeto</h3><p className="text-zinc-500 text-xs mb-8">Atualize as informações principais do job.</p><form onSubmit={handleSaveProject} className="space-y-5"><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nome do Projeto</label><input value={editingProject.name} onChange={e => setEditingProject({...editingProject, name: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Valor (R$)</label><input type="number" value={editingProject.value} onChange={e => setEditingProject({...editingProject, value: parseFloat(e.target.value) || 0})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required /></div><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Deadline</label><input type="date" value={editingProject.deadline} onChange={e => setEditingProject({...editingProject, deadline: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none" required /></div></div><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Qtd. Entregas Previstas</label><input type="number" min="1" value={editingProject.expectedDeliveries || 1} onChange={e => setEditingProject({...editingProject, expectedDeliveries: parseInt(e.target.value) || 1})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" required /></div><div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Briefing / Descrição</label><textarea value={editingProject.description} onChange={e => setEditingProject({...editingProject, description: e.target.value})} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none" /></div><button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 rounded-xl mt-4 uppercase tracking-widest transition-all">Salvar Alterações</button></form></div></div>)}
        {isDeleteProjectModalOpen && projectToDelete && (<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300"><div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-2xl p-6 relative animate-in zoom-in-95 duration-300 shadow-2xl text-center mx-4"><div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 border border-red-500/20"><AlertTriangle size={20} /></div><h3 className="text-xl font-bold text-white mb-2">Excluir Projeto?</h3><p className="text-sm text-zinc-500 mb-6">Você está prestes a excluir permanentemente o projeto <span className="text-white font-bold">"{projectToDelete.name}"</span>. Esta ação não pode ser desfeita.</p><div className="flex gap-3"><button onClick={() => { setIsDeleteProjectModalOpen(false); setProjectToDelete(null); }} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-bold text-xs uppercase hover:bg-white/5 transition-colors">Cancelar</button><button onClick={handleDeleteProject} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase transition-colors shadow-lg shadow-red-500/20">Excluir</button></div></div></div>)}
      </main>
    </div>
  );
};