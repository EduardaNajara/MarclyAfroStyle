using System;
using System.Collections.Generic;
using MarclyAfroStyle.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace MarclyAfroStyle.Api.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Cliente> Clientes { get; set; }

    public virtual DbSet<ConfiguracoesAtelie> ConfiguracoesAtelies { get; set; }

    public virtual DbSet<Pedido> Pedidos { get; set; }

    public virtual DbSet<PedidoAnotaco> PedidoAnotacoes { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.HasKey(e => e.IdCliente).HasName("clientes_pkey");

            entity.ToTable("clientes");

            entity.Property(e => e.IdCliente).HasColumnName("id_cliente");
            entity.Property(e => e.Ativo)
                .HasDefaultValue(true)
                .HasColumnName("ativo");
            entity.Property(e => e.DataNascimento).HasColumnName("data_nascimento");
            entity.Property(e => e.DataRegisto)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("data_registo");
            entity.Property(e => e.Email)
                .HasMaxLength(150)
                .HasColumnName("email");
            entity.Property(e => e.Localizacao)
                .HasMaxLength(150)
                .HasColumnName("localizacao");
            entity.Property(e => e.MedidaBusto)
                .HasPrecision(5, 2)
                .HasColumnName("medida_busto");
            entity.Property(e => e.MedidaCintura)
                .HasPrecision(5, 2)
                .HasColumnName("medida_cintura");
            entity.Property(e => e.MedidaComprimento)
                .HasPrecision(5, 2)
                .HasColumnName("medida_comprimento");
            entity.Property(e => e.MedidaQuadril)
                .HasPrecision(5, 2)
                .HasColumnName("medida_quadril");
            entity.Property(e => e.NomeCompleto)
                .HasMaxLength(150)
                .HasColumnName("nome_completo");
            entity.Property(e => e.Observacoes).HasColumnName("observacoes");
            entity.Property(e => e.TecidoPreferencia)
                .HasMaxLength(150)
                .HasColumnName("tecido_preferencia");
            entity.Property(e => e.Telefone)
                .HasMaxLength(20)
                .HasColumnName("telefone");
        });

        modelBuilder.Entity<ConfiguracoesAtelie>(entity =>
        {
            entity.HasKey(e => e.IdConfiguracao).HasName("configuracoes_atelie_pkey");

            entity.ToTable("configuracoes_atelie");

            entity.Property(e => e.IdConfiguracao).HasColumnName("id_configuracao");
            entity.Property(e => e.ChavePix)
                .HasMaxLength(150)
                .HasColumnName("chave_pix");
            entity.Property(e => e.EmailContato)
                .HasMaxLength(150)
                .HasDefaultValueSql("'contato@marclyafrostyle.com.br'::character varying")
                .HasColumnName("email_contato");
            entity.Property(e => e.EnderecoAtelie)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Rua Duarte da Costa, nº 1631, São Sebastião, Porto Velho - RO'::character varying")
                .HasColumnName("endereco_atelie");
            entity.Property(e => e.LogoUrl).HasColumnName("logo_url");
            entity.Property(e => e.MsgWhatsappAtiva)
                .HasDefaultValue(true)
                .HasColumnName("msg_whatsapp_ativa");
            entity.Property(e => e.MsgWhatsappTemplate)
                .HasDefaultValueSql("'Olá {cliente}, seu pedido ({peca}) está com status: {status}!'::text")
                .HasColumnName("msg_whatsapp_template");
            entity.Property(e => e.NomeAtelie)
                .HasMaxLength(150)
                .HasDefaultValueSql("'Marcly Afro Style'::character varying")
                .HasColumnName("nome_atelie");
            entity.Property(e => e.NomeResponsavel)
                .HasMaxLength(150)
                .HasDefaultValueSql("'Marcly Ramos'::character varying")
                .HasColumnName("nome_responsavel");
            entity.Property(e => e.Slogan)
                .HasMaxLength(255)
                .HasDefaultValueSql("'Organização hoje é mais tempo para o que importa amanhã ♡'::character varying")
                .HasColumnName("slogan");
            entity.Property(e => e.WhatsappComercial)
                .HasMaxLength(20)
                .HasDefaultValueSql("'69999999999'::character varying")
                .HasColumnName("whatsapp_comercial");
        });

        modelBuilder.Entity<Pedido>(entity =>
        {
            entity.HasKey(e => e.IdPedido).HasName("pedidos_pkey");

            entity.ToTable("pedidos");

            entity.Property(e => e.IdPedido).HasColumnName("id_pedido");
            entity.Property(e => e.CondicaoPagamento)
                .HasMaxLength(50)
                .HasDefaultValueSql("'A combinar'::character varying")
                .HasColumnName("condicao_pagamento");
            entity.Property(e => e.DataCorteTecido)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("data_corte_tecido");
            entity.Property(e => e.DataEntregue)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("data_entregue");
            entity.Property(e => e.DataInicioProducao)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("data_inicio_producao");
            entity.Property(e => e.DataPedido)
                .HasDefaultValueSql("CURRENT_DATE")
                .HasColumnName("data_pedido");
            entity.Property(e => e.DataPrevistaEntrega).HasColumnName("data_prevista_entrega");
            entity.Property(e => e.DataProntoEntrega)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("data_pronto_entrega");
            entity.Property(e => e.DataProvaRealizada)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("data_prova_realizada");
            entity.Property(e => e.DataSugeridaProva).HasColumnName("data_sugerida_prova");
            entity.Property(e => e.DetalhesObservacoes).HasColumnName("detalhes_observacoes");
            entity.Property(e => e.IdCliente).HasColumnName("id_cliente");
            entity.Property(e => e.Prioridade).HasColumnName("prioridade");
            entity.Property(e => e.StatusAtual)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Não iniciado'::character varying")
                .HasColumnName("status_atual");
            entity.Property(e => e.TipoPeca)
                .HasMaxLength(150)
                .HasColumnName("tipo_peca");
            entity.Property(e => e.ValorTotal)
                .HasPrecision(10, 2)
                .HasColumnName("valor_total");

            entity.HasOne(d => d.IdClienteNavigation).WithMany(p => p.Pedidos)
                .HasForeignKey(d => d.IdCliente)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_pedido_cliente");
        });

        modelBuilder.Entity<PedidoAnotaco>(entity =>
        {
            entity.HasKey(e => e.IdAnotacao).HasName("pedido_anotacoes_pkey");

            entity.ToTable("pedido_anotacoes");

            entity.Property(e => e.IdAnotacao).HasColumnName("id_anotacao");
            entity.Property(e => e.DataRegisto)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("data_registo");
            entity.Property(e => e.IdPedido).HasColumnName("id_pedido");
            entity.Property(e => e.IdUsuario)
                .HasDefaultValue(1)
                .HasColumnName("id_usuario");
            entity.Property(e => e.TextoComentario).HasColumnName("texto_comentario");
            entity.Property(e => e.TipoTag)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Observação'::character varying")
                .HasColumnName("tipo_tag");

            entity.HasOne(d => d.IdPedidoNavigation).WithMany(p => p.PedidoAnotacos)
                .HasForeignKey(d => d.IdPedido)
                .HasConstraintName("fk_anotacao_pedido");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.PedidoAnotacos)
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_anotacao_usuario");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("usuarios_pkey");

            entity.ToTable("usuarios");

            entity.HasIndex(e => e.Email, "usuarios_email_key").IsUnique();

            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");
            entity.Property(e => e.Ativo)
                .HasDefaultValue(true)
                .HasColumnName("ativo");
            entity.Property(e => e.DataCriacao)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("data_criacao");
            entity.Property(e => e.Email)
                .HasMaxLength(150)
                .HasColumnName("email");
            entity.Property(e => e.NomeCompleto)
                .HasMaxLength(150)
                .HasColumnName("nome_completo");
            entity.Property(e => e.PerfilAcesso)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Administrador'::character varying")
                .HasColumnName("perfil_acesso");
            entity.Property(e => e.SenhaHash)
                .HasMaxLength(255)
                .HasColumnName("senha_hash");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}