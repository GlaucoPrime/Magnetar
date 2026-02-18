package com.mmo.gerenciador.repository;

import com.mmo.gerenciador.model.Personagem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PersonagemRepository extends JpaRepository<Personagem, Long> {
    
    // Busca os personagens de um Gamer específico (Dashboard)
    List<Personagem> findByGamerId(Long gamerId);
    
    // Busca por Nome OU por Jogo (Usado na barra de pesquisa unificada)
    List<Personagem> findByNomeContainingIgnoreCaseOrJogoContainingIgnoreCase(String nome, String jogo);

    // Mantemos estes para buscas específicas caso precise
    List<Personagem> findByNomeContainingIgnoreCase(String nome);
    List<Personagem> findByJogoContainingIgnoreCase(String jogo);
}