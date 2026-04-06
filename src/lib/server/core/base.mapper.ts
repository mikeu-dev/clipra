/**
 * Mapper dasar yang digunakan untuk mengonversi antara
 * entity (database schema) dan DTO (data publik).
 *
 * Kelas ini bersifat generik dan dapat diperluas untuk entitas apa pun.
 */
export abstract class BaseMapper<Entity, DTO> {
	/**
	 * Mengonversi entity (biasanya hasil dari repository)
	 * menjadi DTO publik yang siap dikirim ke client.
	 */
	abstract toDTO(entity: Entity): DTO;

	/**
	 * Mengonversi DTO (biasanya dari input client)
	 * menjadi entity untuk disimpan di database.
	 */
	abstract toEntity(dto: DTO): Entity;

	/**
	 * Mengonversi array entity ke array DTO.
	 */
	toDTOs(entities: Entity[]): DTO[] {
		return entities.map((entity) => this.toDTO(entity));
	}
}
