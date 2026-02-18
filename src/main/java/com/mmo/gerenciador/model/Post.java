package com.mmo.gerenciador.model;

import jakarta.persistence.*;
import java.util.*;

@Entity
public class Post {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String conteudo;
    
    @ManyToOne
    private Personagem autor;
    
    @ManyToMany
    private Set<Personagem> curtidas = new HashSet<>();
    
    @ElementCollection
    private List<String> comentarios = new ArrayList<>();
    
    // GETTERS E SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }
    
    public Personagem getAutor() { return autor; }
    public void setAutor(Personagem autor) { this.autor = autor; }
    
    public Set<Personagem> getCurtidas() { return curtidas; }
    public void setCurtidas(Set<Personagem> curtidas) { this.curtidas = curtidas; }
    
    public List<String> getComentarios() { return comentarios; }
    public void setComentarios(List<String> comentarios) { this.comentarios = comentarios; }
}