package TriForm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;


//Triform Application
//Scans all directories
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
//Enables Repositories
@EnableJpaRepositories(basePackages = {"repositories"})
@EntityScan(basePackages = {"entities"})
public class TriFormApplication {

	public static void main(String[] args) {
        
		SpringApplication.run(TriFormApplication.class, args);

    }

}
