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

interface Report {
  id: string;
  technician: string;
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

  // UseCallback para evitar recriação da função em cada render
  const fetchReports = useCallback(async () => {
    if (!user) return;
    const q = query(
      collection(db, "serviceReports"),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);
    const fetchedReports: Report[] = [];
    querySnapshot.forEach((doc) => {
      fetchedReports.push({ id: doc.id, ...doc.data() } as Report);
    });
    setReports(fetchedReports);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      fetchReports();
    }
  }, [user, loading, router, fetchReports]); // fetchReports agora está no array de dependências

  const handleExpand = (report: Report) => {
    setExpandedReport(report);
  };

  const handleEdit = (report: Report) => {
    setEditedReport(report);
    setIsEditing(true);
  };

  const handleDelete = async (reportId: string) => {
    if (confirm("Tem certeza que deseja excluir este relatório?")) {
      await deleteDoc(doc(db, "serviceReports", reportId));
      await fetchReports();
    }
  };

  const handleUpdate = async () => {
    if (!editedReport) return;
    await updateDoc(doc(db, "serviceReports", editedReport.id), {
      technician: editedReport.technician,
      date: editedReport.date,
      description: editedReport.description,
    });
    setIsEditing(false);
    setEditedReport(null);
    await fetchReports();
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
                  <strong>Descrição:</strong>{" "}
                  {report.description.substring(0, 100)}...
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => handleExpand(report)}
                >
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
