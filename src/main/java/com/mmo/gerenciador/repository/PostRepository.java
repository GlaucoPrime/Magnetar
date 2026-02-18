package com.mmo.gerenciador.repository;

import com.mmo.gerenciador.model.Post;
import com.mmo.gerenciador.model.Personagem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
}