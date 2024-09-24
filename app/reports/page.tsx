"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Definindo o tipo Report de forma mais clara
interface Report {
  id: string;
  technician: string;
  officeTime: string;
  date: string;
  description: string;
}

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [expandedReport, setExpandedReport] = useState<Report | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReport, setEditedReport] = useState<Report | null>(null);

  // Função para buscar relatórios
  const fetchReports = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, "serviceReports"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedReports = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];

      setReports(fetchedReports);
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
    }
  }, [user]);

  // Redireciona se o usuário não estiver logado, ou busca os relatórios se estiver logado
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      fetchReports();
    }
  }, [user, loading, router, fetchReports]);

  // Lidar com a edição de um relatório
  const handleEdit = (report: Report) => {
    setEditedReport(report);
    setIsEditing(true);
  };

  // Lidar com a exclusão de um relatório
  const handleDelete = async (reportId: string) => {
    if (!confirm("Tem certeza que deseja excluir este relatório?")) return;

    try {
      await deleteDoc(doc(db, "serviceReports", reportId));
      await fetchReports(); // Atualizar relatórios
    } catch (error) {
      console.error("Erro ao excluir relatório:", error);
    }
  };

  // Lidar com a atualização do relatório
  const handleUpdate = async () => {
    if (!editedReport) return;

    try {
      await updateDoc(doc(db, "serviceReports", editedReport.id), {
        technician: editedReport.technician,
        officeTime: editedReport.officeTime,
        date: editedReport.date,
        description: editedReport.description,
      });

      setIsEditing(false);
      setEditedReport(null);
      await fetchReports();
    } catch (error) {
      console.error("Erro ao atualizar relatório:", error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Meus Relatórios</h1>
        <Button onClick={() => router.push("/dashboard")} className="mb-4">
          Voltar para o Dashboard
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>{report.technician}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Data:</strong> {report.date}
                </p>
                <p>
                  <strong>Horário:</strong> {report.officeTime}
                </p>
                <p>
                  <strong>Descrição:</strong>{" "}
                  {report.description.substring(0, 100)}...
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button onClick={() => setExpandedReport(report)}>
                  Expandir
                </Button>
                <Button onClick={() => handleEdit(report)}>Editar</Button>
                <Button
                  onClick={() => handleDelete(report.id)}
                  variant="destructive"
                >
                  Excluir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialog para expandir relatório */}
      <Dialog
        open={!!expandedReport}
        onOpenChange={() => setExpandedReport(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{expandedReport?.technician}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p>
              <strong>Data:</strong> {expandedReport?.date}
            </p>
            <p>
              <strong>Horário:</strong> {expandedReport?.officeTime}
            </p>
            <p>
              <strong>Descrição:</strong> {expandedReport?.description}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar relatório */}
      <Dialog
        open={isEditing}
        onOpenChange={(open) => {
          setIsEditing(open);
          if (!open) setEditedReport(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Relatório</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="edit-technician">Técnico</Label>
              <Input
                id="edit-technician"
                value={editedReport?.technician || ""}
                onChange={(e) =>
                  setEditedReport((prev) =>
                    prev ? { ...prev, technician: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={editedReport?.date || ""}
                onChange={(e) =>
                  setEditedReport((prev) =>
                    prev ? { ...prev, date: e.target.value } : null
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-officeTime">Horário de Trabalho</Label>
              <Select
                value={editedReport?.officeTime || ""}
                onValueChange={(value) =>
                  setEditedReport((prev) =>
                    prev ? { ...prev, officeTime: value } : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Horário</SelectLabel>
                    <SelectItem value="05:00 - 14:00">05:00 - 14:00</SelectItem>
                    <SelectItem value="08:00 - 18:00">08:00 - 18:00</SelectItem>
                    <SelectItem value="09:00 - 18:00">09:00 - 18:00</SelectItem>
                    <SelectItem value="10:00 - 20:00">10:00 - 20:00</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={editedReport?.description || ""}
                onChange={(e) =>
                  setEditedReport((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
