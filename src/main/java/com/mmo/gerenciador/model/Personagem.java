package com.mmo.gerenciador.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Set;
import java.util.HashSet;

@Entity
public class Personagem {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nome;
    private String jogo;
    private String imagemUrl;
    
    @Column(length = 500)
    private String bio;

    @ManyToOne
    @JoinColumn(name = "gamer_id")
    @JsonIgnore
    private Gamer gamer;

    // CORREÇÃO: Adicionar cascade e fetch corretos
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinTable(
        name = "relacao_seguidores",
        joinColumns = @JoinColumn(name = "seguidor_id"),
        inverseJoinColumns = @JoinColumn(name = "seguido_id")
    )
    @JsonIgnore
    private Set<Personagem> seguindo = new HashSet<>();

    @ManyToMany(mappedBy = "seguindo", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Personagem> seguidores = new HashSet<>();

    // GETTERS E SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    
    public String getJogo() { return jogo; }
    public void setJogo(String jogo) { this.jogo = jogo; }
    
    public String getImagemUrl() { return imagemUrl; }
    public void setImagemUrl(String imagemUrl) { this.imagemUrl = imagemUrl; }
    
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    
    public Gamer getGamer() { return gamer; }
    public void setGamer(Gamer gamer) { this.gamer = gamer; }
    
    public Set<Personagem> getSeguindo() { return seguindo; }
    public void setSeguindo(Set<Personagem> seguindo) { this.seguindo = seguindo; }
    
    public Set<Personagem> getSeguidores() { return seguidores; }
    public void setSeguidores(Set<Personagem> seguidores) { this.seguidores = seguidores; }
}