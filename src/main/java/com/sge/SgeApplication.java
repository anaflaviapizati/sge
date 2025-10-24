package com.sge;

import com.sge.services.CursoService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SgeApplication {

	public static void main(String[] args) {
		SpringApplication.run(SgeApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(CursoService cursoService) {
		return args -> {
			cursoService.initializeCursos();
		};
	}
}
