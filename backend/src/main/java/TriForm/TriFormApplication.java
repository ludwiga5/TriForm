package TriForm;


import java.nio.file.Files;
import java.nio.file.Paths;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


@SpringBootApplication(scanBasePackages = {
    "TriForm",
    "config",
    "controllers",
    "dto",
    "entities",
    "exceptions",
    "repositories",
    "security",
    "services"
})
@EnableJpaRepositories(basePackages = {"repositories"})
@EntityScan(basePackages = {"entities"})
public class TriFormApplication {

	public static void main(String[] args) {
        
		SpringApplication.run(TriFormApplication.class, args);

       Path cwd = Paths.get(System.getProperty("user.dir"));
       System.out.println("cwd = " + cwd.toAbsolutePath());
       Path db = cwd.resolve("data/triform.db");
       System.out.println("looking for data/triform.db -> " + db.toAbsolutePath() + " exists? " + Files.exists(db));
	}

}
