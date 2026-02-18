package com.mmo.gerenciador.controller;

import com.mmo.gerenciador.model.Personagem;
import com.mmo.gerenciador.model.Gamer;
import com.mmo.gerenciador.repository.PersonagemRepository;
import com.mmo.gerenciador.repository.GamerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/personagens")
public class PersonagemController {

    @Autowired 
    private PersonagemRepository repository;
    
    @Autowired
    private GamerRepository gamerRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<?> criar(@RequestBody Map<String, Object> payload) {
        try {
            System.out.println("=== PAYLOAD RECEBIDO ===");
            System.out.println(payload);
            
            // Extrai o gamerId do payload - VARIÁVEL FINAL
            final Long gamerId;
            
            if (payload.get("gamerId") != null) {
                gamerId = Long.valueOf(payload.get("gamerId").toString());
            } else if (payload.get("gamer") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> gamerMap = (Map<String, Object>) payload.get("gamer");
                gamerId = Long.valueOf(gamerMap.get("id").toString());
            } else {
                return ResponseEntity.badRequest().body("GamerID não encontrado no payload!");
            }
            
            System.out.println("GamerID extraído: " + gamerId);
            
            // Busca o Gamer
            Gamer gamer = gamerRepository.findById(gamerId)
                .orElseThrow(() -> new RuntimeException("Gamer com ID " + gamerId + " não encontrado!"));
            
            // Cria o personagem
            Personagem p = new Personagem();
            p.setNome(payload.get("nome").toString());
            p.setJogo(payload.get("jogo").toString());
            p.setImagemUrl(payload.getOrDefault("imagemUrl", "https://via.placeholder.com/150").toString());
            p.setBio(payload.getOrDefault("bio", "").toString());
            p.setGamer(gamer);
            
            Personagem salvo = repository.save(p);
            System.out.println("✅ Personagem salvo com ID: " + salvo.getId());
            
            return ResponseEntity.ok(salvo);
            
        } catch(Exception e) {
            System.err.println("❌ ERRO: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @GetMapping("/meus/{gamerId}")
    public ResponseEntity<?> listarMeus(@PathVariable Long gamerId) {
        try {
            System.out.println("=== BUSCANDO PERSONAGENS DO GAMER " + gamerId + " ===");
            List<Personagem> personagens = repository.findByGamerId(gamerId);
            System.out.println("📦 Encontrados: " + personagens.size() + " personagens");
            return ResponseEntity.ok(personagens);
        } catch(Exception e) {
            System.err.println("❌ ERRO: " + e.getMessage());
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @GetMapping("/perfil/{id}")
    public Map<String, Object> detalhar(@PathVariable Long id) {
        Personagem p = repository.findById(id).orElseThrow();
        Map<String, Object> dto = new HashMap<>();
        
        dto.put("id", p.getId());
        dto.put("nome", p.getNome());
        dto.put("jogo", p.getJogo());
        dto.put("imagem", p.getImagemUrl());
        dto.put("ownerGamerId", p.getGamer() != null ? p.getGamer().getId() : null);
        dto.put("seguidoresCount", p.getSeguidores().size());
        dto.put("seguindoCount", p.getSeguindo().size());
        
        List<Long> seguidoresIds = p.getSeguidores().stream()
                                    .map(Personagem::getId)
                                    .collect(Collectors.toList());
        dto.put("seguidoresIds", seguidoresIds);
        
        return dto;
    }

    @GetMapping("/buscar")
    public List<Personagem> buscar(@RequestParam String termo) {
        return repository.findByNomeContainingIgnoreCaseOrJogoContainingIgnoreCase(termo, termo);
    }
    

    @GetMapping("/perfil/{id}/seguindo")
    public ResponseEntity<?> listarSeguindo(@PathVariable Long id) {
        try {
            Personagem p = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Personagem não encontrado"));
            
            List<Map<String, Object>> seguindo = p.getSeguindo().stream().map(s -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", s.getId());
                dto.put("nome", s.getNome());
                dto.put("jogo", s.getJogo());
                dto.put("imagem", s.getImagemUrl());
                return dto;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(seguindo);
        } catch(Exception e) {
            System.err.println("❌ Erro ao listar seguindo: " + e.getMessage());
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @PostMapping("/{idAlvo}/seguir/{meuId}")
    @Transactional
    public Map<String, Object> toggleSeguir(@PathVariable Long idAlvo, @PathVariable Long meuId) {
        if(idAlvo.equals(meuId)) {
            return Map.of("erro", "Auto-follow negado");
        }

        Personagem alvo = repository.findById(idAlvo)
            .orElseThrow(() -> new RuntimeException("Personagem alvo não encontrado"));
        
        Personagem eu = repository.findById(meuId)
            .orElseThrow(() -> new RuntimeException("Seu personagem não encontrado"));

        eu.getSeguindo().size();
        alvo.getSeguidores().size();

        boolean estavoSeguindo = eu.getSeguindo().contains(alvo);
        
        if (estavoSeguindo) {
            eu.getSeguindo().remove(alvo);
            alvo.getSeguidores().remove(eu);
        } else {
            eu.getSeguindo().add(alvo);
            alvo.getSeguidores().add(eu);
        }
        
        repository.save(eu);
        repository.save(alvo);
        
        alvo = repository.findById(idAlvo).orElseThrow();
        
        return Map.of(
            "isFollowing", !estavoSeguindo,
            "newCount", alvo.getSeguidores().size()
        );
    }
}