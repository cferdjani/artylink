"use client";
import { useToast } from "@/components/ui/toast";
import { Mic, Square } from "lucide-react";
import { useRef, useState } from "react";

export function AudioRecorder({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const { toast } = useToast();

    const startRecording = async () => {
        // Sécurité : le micro n'est accessible qu'en localhost ou en HTTPS
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast("L'enregistrement audio nécessite une connexion sécurisée (HTTPS) ou n'est pas supporté.", "error");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Compatibilité : WebM pour Android/PC, MP4/M4A pour iPhone/Safari
            const options = MediaRecorder.isTypeSupported('audio/webm')
                ? { mimeType: 'audio/webm' }
                : MediaRecorder.isTypeSupported('audio/mp4')
                    ? { mimeType: 'audio/mp4' }
                    : undefined;

            mediaRecorderRef.current = new MediaRecorder(stream, options);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
                const blob = new Blob(chunksRef.current, { type: mimeType });
                onRecordingComplete(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err: any) {
            console.error("Audio recording failed:", err);
            toast("Impossible d'accéder au micro. Veuillez vérifier les permissions de votre navigateur.", "error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`p-3 rounded-xl transition-colors ${isRecording ? 'text-rose-500 bg-rose-50 hover:bg-rose-100 animate-pulse' : 'text-slate-500 hover:text-primary hover:bg-slate-100'}`} title={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"}>
            {isRecording ? <Square size={20} /> : <Mic size={20} />}
        </button>
    );
}