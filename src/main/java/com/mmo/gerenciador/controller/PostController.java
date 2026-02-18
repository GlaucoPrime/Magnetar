package com.mmo.gerenciador.controller;

import com.mmo.gerenciador.model.Personagem;
import com.mmo.gerenciador.model.Post;
import com.mmo.gerenciador.repository.PersonagemRepository;
import com.mmo.gerenciador.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostRepository repository;
    
    @Autowired
    private PersonagemRepository personagemRepository;

    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Post post) {
        Post salvo = repository.save(post);
        return ResponseEntity.ok(salvo);
    }

    @GetMapping("/timeline/{personagemId}")
    public ResponseEntity<?> timeline(@PathVariable Long personagemId) {
        try {
            Personagem p = personagemRepository.findById(personagemId).orElseThrow();
            List<Post> allPosts = repository.findAll();
            
            List<Map<String, Object>> postsDTO = allPosts.stream().map(post -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("id", post.getId());
                dto.put("conteudo", post.getConteudo());
                dto.put("comentarios", post.getComentarios());
                dto.put("curtidasCount", post.getCurtidas().size());
                
                // IDs dos PERSONAGENS que curtiram
                List<Long> curtidasIds = post.getCurtidas().stream()
                    .map(Personagem::getId)
                    .collect(Collectors.toList());
                dto.put("curtidasIds", curtidasIds);
                
                Map<String, Object> autorDTO = new HashMap<>();
                autorDTO.put("id", post.getAutor().getId());
                autorDTO.put("nome", post.getAutor().getNome());
                autorDTO.put("imagemUrl", post.getAutor().getImagemUrl());
                dto.put("autor", autorDTO);
                
                return dto;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(postsDTO);
        } catch(Exception e) {
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/curtir/{personagemId}")
    public ResponseEntity<?> curtir(@PathVariable Long id, @PathVariable Long personagemId) {
        try {
            Post post = repository.findById(id).orElseThrow();
            Personagem personagem = personagemRepository.findById(personagemId).orElseThrow();
            
            if(post.getCurtidas().contains(personagem)) {
                post.getCurtidas().remove(personagem);
            } else {
                post.getCurtidas().add(personagem);
            }
            
            repository.save(post);
            return ResponseEntity.ok("OK");
        } catch(Exception e) {
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/comentar")
    public ResponseEntity<?> comentar(@PathVariable Long id, @RequestParam String nomeAutor, @RequestBody String comentario) {
        try {
            Post post = repository.findById(id).orElseThrow();
            post.getComentarios().add(nomeAutor + ": " + comentario);
            repository.save(post);
            return ResponseEntity.ok("OK");
        } catch(Exception e) {
            return ResponseEntity.status(500).body("Erro: " + e.getMessage());
        }
    }
}