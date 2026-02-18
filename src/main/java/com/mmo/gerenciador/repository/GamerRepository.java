package com.mmo.gerenciador.repository;

import com.mmo.gerenciador.model.Gamer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface GamerRepository extends JpaRepository<Gamer, Long> {
    Optional<Gamer> findByEmail(String email);
}