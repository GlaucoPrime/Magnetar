package com.mmo.gerenciador.controller;

import com.mmo.gerenciador.model.Gamer;
import com.mmo.gerenciador.repository.GamerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private GamerRepository repository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody Gamer gamer) {
        System.out.println("=== CADASTRO ===");
        System.out.println("Email: " + gamer.getEmail());
        
        if(repository.findByEmail(gamer.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("E-mail já cadastrado!");
        }
        
        // CRIPTOGRAFA A SENHA ANTES DE SALVAR
        String senhaCriptografada = passwordEncoder.encode(gamer.getSenha());
        gamer.setSenha(senhaCriptografada);
        
        Gamer salvo = repository.save(gamer);
        System.out.println("✅ Gamer cadastrado com ID: " + salvo.getId());
        System.out.println("🔒 Senha criptografada: " + senhaCriptografada);
        
        return ResponseEntity.ok(Map.of(
            "id", salvo.getId(),
            "nomeReal", salvo.getNomeReal(),
            "email", salvo.getEmail()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String senha) {
        System.out.println("=== LOGIN ===");
        System.out.println("Email: " + email);
        
        Optional<Gamer> gamerOpt = repository.findByEmail(email);
        
        if (gamerOpt.isEmpty()) {
            System.out.println("❌ Email não encontrado");
            return ResponseEntity.status(401).body("Email não encontrado");
        }
        
        Gamer gamer = gamerOpt.get();
        
        // COMPARA A SENHA COM BCRYPT
        if (!passwordEncoder.matches(senha, gamer.getSenha())) {
            System.out.println("❌ Senha incorreta");
            return ResponseEntity.status(401).body("Senha incorreta");
        }
        
        System.out.println("✅ Login bem-sucedido! GamerID: " + gamer.getId());
        
        return ResponseEntity.ok(Map.of(
            "id", gamer.getId(),
            "nomeReal", gamer.getNomeReal(),
            "email", gamer.getEmail()
        ));
    }
}