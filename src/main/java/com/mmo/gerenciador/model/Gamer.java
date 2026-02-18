package com.mmo.gerenciador.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
public class Gamer {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nomeReal;
    private String email;
    private String senha;

    @OneToMany(mappedBy = "gamer", cascade = CascadeType.ALL, orphanRemoval = false)
    @JsonIgnore
    private List<Personagem> personagens;

    // GETTERS E SETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNomeReal() { return nomeReal; }
    public void setNomeReal(String nomeReal) { this.nomeReal = nomeReal; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    
    public List<Personagem> getPersonagens() { return personagens; }
    public void setPersonagens(List<Personagem> personagens) { this.personagens = personagens; }
}