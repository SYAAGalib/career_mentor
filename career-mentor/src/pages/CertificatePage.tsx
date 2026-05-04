import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Award, Download, Share2, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/AppContext";
import { fireExamPassConfetti } from "@/lib/confetti";
import { toast } from "sonner";

export default function CertificatePage() {
  const navigate = useNavigate();
  const { state, issueCertificate } = useApp();
  const roadmap = state.roadmap;
  const [name, setName] = useState("");
  const [issued, setIssued] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const existingCert = roadmap
    ? state.certificates.find(c => c.roadmapTitle === roadmap.title)
    : null;

  const finalMilestone = roadmap?.milestones.find(m => m.isFinal);
  const canIssueCert = finalMilestone?.status === "passed";

  const handleDownloadPDF = useCallback(async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = canvas.width / canvas.height;
      let imgWidth = pageWidth - 20;
      let imgHeight = imgWidth / imgRatio;

      if (imgHeight > pageHeight - 20) {
        imgHeight = pageHeight - 20;
        imgWidth = imgHeight * imgRatio;
      }

      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`certificate-${cert?.roadmapTitle?.replace(/\s+/g, "-").toLowerCase() || "completion"}.pdf`);
      toast.success("Certificate downloaded!");
    } catch (error) {
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, []);

  if (!roadmap || !canIssueCert) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Certificate Not Available</h1>
          <p className="text-muted-foreground mb-6">Complete all milestones and pass the final exam to earn your certificate.</p>
          <Button onClick={() => navigate("/roadmap")} className="gradient-primary text-primary-foreground">
            Back to Roadmap
          </Button>
        </div>
      </div>
    );
  }

  const cert = existingCert || (issued ? state.certificates.find(c => c.roadmapTitle === roadmap.title) : null);

  const handleIssue = () => {
    if (!name.trim()) return;
    const result = issueCertificate(name.trim());
    if (result) {
      setIssued(true);
      setTimeout(() => fireExamPassConfetti(), 300);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!cert) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6"
          >
            <Award className="w-10 h-10 text-accent-foreground" />
          </motion.div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Congratulations! 🎓</h1>
          <p className="text-muted-foreground mb-8">
            You've completed <span className="text-primary font-semibold">{roadmap.title}</span> and passed the final exam!
            Enter your name to generate your digital certificate.
          </p>
          <div className="space-y-4">
            <Input
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-card border-border text-center text-lg h-12"
              onKeyDown={e => e.key === "Enter" && handleIssue()}
            />
            <Button
              onClick={handleIssue}
              disabled={!name.trim()}
              className="w-full gradient-primary text-primary-foreground h-12 text-base"
            >
              Generate Certificate
            </Button>
          </div>
          <button
            onClick={() => navigate("/roadmap")}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Roadmap
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/roadmap")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Roadmap
        </button>

        <motion.div
          ref={certRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative bg-card border-2 border-primary/30 rounded-2xl overflow-hidden"
        >
          <div className="gradient-primary h-2" />
          <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/20 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary/20 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary/20 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/20 rounded-br-lg" />

          <div className="px-8 py-12 md:px-16 md:py-16 text-center">
            <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6 glow-accent">
              <Award className="w-8 h-8 text-accent-foreground" />
            </div>

            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium mb-1">Certificate of Completion</p>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">{cert.roadmapTitle}</h1>

            <p className="text-sm text-muted-foreground mb-1">This certifies that</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary mb-6">{cert.holderName}</h2>

            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
              has successfully completed all milestones and passed the final comprehensive examination,
              demonstrating proficiency in the subject matter.
            </p>

            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-primary font-bold text-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  {cert.milestoneCount}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Milestones</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xp font-bold text-lg">
                  <Zap className="w-4 h-4" />
                  {cert.totalXp}
                </div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">XP Earned</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-success font-bold text-lg">{cert.finalExamScore}%</div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Final Score</p>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex items-center justify-between text-xs text-muted-foreground">
              <span>Issued: {formatDate(cert.issuedAt)}</span>
              <span className="font-mono text-[10px]">ID: {cert.id}</span>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-3 mt-6 justify-center">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="gradient-primary text-primary-foreground"
          >
            <Download className="w-4 h-4 mr-2" /> {downloading ? "Generating..." : "Download PDF"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const text = `🎓 I earned my ${cert.roadmapTitle} certificate! Score: ${cert.finalExamScore}% | ${cert.totalXp} XP earned`;
              navigator.clipboard.writeText(text);
              toast.success("Certificate details copied to clipboard!");
            }}
            className="border-border"
          >
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}
