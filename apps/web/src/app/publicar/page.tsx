'use client';

import { Navbar } from '@/components/navbar';
import { FooterSimple } from '@/components/footer-simple';
import { CheckCircle, Smartphone, MessageCircle, Camera } from 'lucide-react';
import Link from 'next/link';

export default function PublicarPage() {
  return (
    <div className="min-h-screen bg-cream-100">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-foreground-muted">
            <span className="text-accent">Portal Premium</span>
            <span>&gt;</span>
            <span>Área do proprietário</span>
            <span>&gt;</span>
            <span className="text-foreground">Como colocar um anúncio</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-lime-100 border-b border-lime-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="font-serif text-3xl text-foreground mb-2">
            Como colocar um anúncio no Portal Premium
          </h1>
          <p className="text-body text-foreground-muted">
            Vender ou arrendar o seu imóvel nunca foi tão fácil
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Benefits */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Os teus 3 primeiros anúncios são grátis
                </h3>
                <p className="text-body text-foreground-muted">
                  Podes publicar até 3 anúncios gratuitos. Depois, escolhe um plano que se adapte às tuas necessidades.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Área privada de gestão
                </h3>
                <p className="text-body text-foreground-muted">
                  Tens acesso a uma área privada onde podes gerir o teu anúncio e os contactos que recebes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Chat integrado
                </h3>
                <p className="text-body text-foreground-muted">
                  Podes resolver questões, trocar informações e organizar visitas de uma forma eficiente através do nosso chat.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Até 40 fotos e vídeos
                </h3>
                <p className="text-body text-foreground-muted">
                  Adiciona fotos, plantas e vídeos ao teu anúncio para atrair mais interessados.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/publicar/novo"
                className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white rounded-xl font-medium text-lg hover:bg-accent/90 transition-colors shadow-elevated"
              >
                Publica o teu anúncio grátis
              </Link>
            </div>

            <div className="pt-4 text-sm text-foreground-muted">
              <p>
                É um profissional imobiliário?{' '}
                <Link href="/planos" className="text-accent hover:underline">
                  Conhece as vantagens que oferecemos para profissionais
                </Link>
              </p>
            </div>
          </div>

          {/* Right: Info box */}
          <div className="bg-white rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-serif text-heading-3 text-foreground mb-4">
              Informação útil
            </h3>
            <div className="space-y-4 text-body text-foreground-muted">
              <p>
                Prepara as fotos. Se ainda não as tens, poderás adicioná-las mais tarde. Sem fotos não obterás resultados.
              </p>
              <p>
                Oferecemos-te os três primeiros anúncios para que experimentes o nosso serviço. Podes publicar anúncios grátis de apartamentos, moradias, terrenos, espaços comerciais, etc. até que o vendas ou arrendes.
              </p>
              <p>
                Para garantir a qualidade dos nossos serviços, cobramos uma taxa nos seguintes casos:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>anunciantes com mais de três imóveis</li>
                <li>anunciantes de imóveis duplicados</li>
                <li>imóveis à venda por mais de 1.000.000 de euros</li>
                <li>imóveis em arrendamento por mais de 3.000 €/mês</li>
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-600 text-lg">⚡</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Queres vender a tua casa rapidamente?</p>
                  <Link href="/painel/agente/planos" className="text-accent text-sm hover:underline">
                    Encontra a agência imobiliária mais adequada
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterSimple />
    </div>
  );
}
